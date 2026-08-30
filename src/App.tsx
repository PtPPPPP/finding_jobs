import { useEffect, useMemo, useRef, useState } from "react";
import { CompanyTable } from "./components/CompanyTable";
import { CandidateComparison } from "./components/CandidateComparison";
import { FilterBar } from "./components/FilterBar";
import { FooterDisclaimer } from "./components/FooterDisclaimer";
import { LegalPage } from "./components/LegalPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { Hero } from "./components/Hero";
import { JobRoleSection } from "./components/JobRoleSection";
import { QuickPick } from "./components/QuickPick";
import { SkillMatrix } from "./components/SkillMatrix";
import { companies } from "./data/companies";
import { companyRoleFits } from "./data/companyRoleFits";
import { jobFunctions, jobTracks } from "./data/jobFunctions";
import { jobRoles } from "./data/jobRoles";
import { skillDefinitions, skills } from "./data/skills";
import type {
  CompanyFilters,
  CompanySortKey,
  JobRoleFilters,
  QuickPickPreferences,
} from "./types";
import {
  defaultCompanyFilters,
  defaultJobRoleFilters,
  parseFilterQuery,
  serializeFilterQuery,
} from "./utils/filterQuery";
import { enrichCompaniesWithRoleDirections } from "./utils/companyRoleDirections";
import { filterCompanies } from "./utils/filterCompanies";
import { sortCompanies } from "./utils/sortCompanies";

const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, "zh-CN"));
const companiesWithRoleDirections = enrichCompaniesWithRoleDirections(
  companies,
  jobRoles,
  companyRoleFits,
);
const categoryOptions = unique(
  companiesWithRoleDirections.flatMap((company) => company.category),
);
const roleOptions = jobRoles.map((role) => role.title);
const queryOptions = {
  categories: categoryOptions,
  roles: roleOptions,
  skills,
  jobFunctions,
  jobTracks,
  jobRoleIds: jobRoles.map((role) => role.id),
  candidateRoleIds: jobRoles
    .filter((role) => role.roleKind === "career-direction")
    .map((role) => role.id),
};

type HistoryMode = "push" | "replace";

const readQueryState = () => parseFilterQuery(window.location.search, queryOptions);

const routeBasePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// 站点部署在 /finding-jobs/ 子路径下：先把 base 前缀归一化，再做页面判断，
// 这样根路径部署（/）与子路径部署的行为保持一致。
const resolveRoutePath = () => {
  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  if (routeBasePath && pathname.startsWith(routeBasePath)) {
    return pathname.slice(routeBasePath.length) || "/";
  }
  return pathname;
};

// App 只做路由分发、不调用 Hooks；所有 Hooks 都在 HomePage 中无条件调用，
// 避免"条件性调用 Hooks"违反 React 规则。
function App() {
  const path = resolveRoutePath();
  if (path === "/privacy") return <LegalPage page="privacy" />;
  if (path === "/terms") return <LegalPage page="terms" />;
  if (path !== "/") return <NotFoundPage />;
  return <HomePage />;
}

function HomePage() {
  const [queryState] = useState(readQueryState);
  const [filters, setFilters] = useState<CompanyFilters>(queryState.filters);
  const [sortKey, setSortKey] = useState<CompanySortKey>(queryState.sortKey);
  const [jobRoleFilters, setJobRoleFilters] = useState<JobRoleFilters>(
    queryState.jobRoleFilters,
  );
  const [candidateRoleIds, setCandidateRoleIds] = useState<string[]>(
    queryState.decisionState.candidateRoleIds,
  );
  const [quickPickPreferences, setQuickPickPreferences] =
    useState<QuickPickPreferences>(
      queryState.decisionState.quickPickPreferences,
    );
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const companiesRef = useRef<HTMLElement>(null);
  const rolesRef = useRef<HTMLDivElement>(null);
  const historyModeRef = useRef<HistoryMode>("replace");

  const categories = categoryOptions;
  const roles = roleOptions;

  const filteredCompanies = useMemo(
    () =>
      sortCompanies(
        filterCompanies(companiesWithRoleDirections, filters),
        sortKey,
      ),
    [filters, sortKey],
  );

  const scrollToCompanies = () => {
    companiesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToRoles = () => {
    rolesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const onPopState = () => {
      const nextState = readQueryState();
      setFilters(nextState.filters);
      setSortKey(nextState.sortKey);
      setJobRoleFilters(nextState.jobRoleFilters);
      setCandidateRoleIds(nextState.decisionState.candidateRoleIds);
      setQuickPickPreferences(nextState.decisionState.quickPickPreferences);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const nextSearch = serializeFilterQuery(filters, sortKey, jobRoleFilters, {
      candidateRoleIds,
      quickPickPreferences,
    });
    const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      const method = historyModeRef.current === "push" ? "pushState" : "replaceState";
      window.history[method](null, "", nextUrl);
    }

    historyModeRef.current = "replace";
  }, [candidateRoleIds, filters, jobRoleFilters, quickPickPreferences, sortKey]);

  const updateFilters = (nextFilters: CompanyFilters, historyMode: HistoryMode) => {
    historyModeRef.current = historyMode;
    setFilters(nextFilters);
  };

  const updateSort = (nextSortKey: CompanySortKey) => {
    historyModeRef.current = "push";
    setSortKey(nextSortKey);
  };

  const updateJobRoleFilters = (
    nextFilters: JobRoleFilters,
    historyMode: HistoryMode,
  ) => {
    historyModeRef.current = historyMode;
    setJobRoleFilters(nextFilters);
  };

  const selectSkill = (skill: string) => {
    historyModeRef.current = "push";
    setFilters((currentFilters) => ({
      ...currentFilters,
      skill: currentFilters.skill === skill ? "" : skill,
    }));
    setTimeout(scrollToCompanies, 0);
  };

  const toggleCandidate = (roleId: string) => {
    const role = jobRoles.find((item) => item.id === roleId);
    if (!role || role.roleKind === "graduate-entry") return;
    historyModeRef.current = "push";
    setCandidateRoleIds((current) => {
      if (current.includes(roleId)) return current.filter((id) => id !== roleId);
      return current.length < 5 ? [...current, roleId] : current;
    });
  };

  const clearCandidates = () => {
    historyModeRef.current = "push";
    setCandidateRoleIds([]);
  };

  const updateQuickPickPreferences = (preferences: QuickPickPreferences) => {
    historyModeRef.current = "replace";
    setQuickPickPreferences(preferences);
  };

  const resetFilters = () => {
    historyModeRef.current = "push";
    setFilters(defaultCompanyFilters);
    setJobRoleFilters(defaultJobRoleFilters);
    setSortKey("fitScore");
    setExpandedCompanyId(null);
  };

  const toggleCompany = (id: string) => {
    setExpandedCompanyId((current) => (current === id ? null : id));
  };

  const showRelatedCompany = (companyId: string) => {
    const company = companiesWithRoleDirections.find(
      (item) => item.id === companyId,
    );
    if (!company) return;

    historyModeRef.current = "push";
    setFilters((currentFilters) => ({
      ...currentFilters,
      keyword: company.name,
    }));
    setExpandedCompanyId(company.id);
    setTimeout(scrollToCompanies, 0);
  };

  return (
    <div className="min-h-screen">
      <Hero onCompaniesClick={scrollToCompanies} onRolesClick={scrollToRoles} />
      <QuickPick
        roles={jobRoles}
        preferences={quickPickPreferences}
        candidateRoleIds={candidateRoleIds}
        onPreferencesChange={updateQuickPickPreferences}
        onToggleCandidate={toggleCandidate}
      />

      <div ref={rolesRef}>
        <JobRoleSection
          roles={jobRoles}
          companies={companiesWithRoleDirections}
          fits={companyRoleFits}
          activeSkill={filters.skill}
          filters={jobRoleFilters}
          candidateRoleIds={candidateRoleIds}
          onFiltersChange={updateJobRoleFilters}
          onCompanySelect={showRelatedCompany}
          onToggleCandidate={toggleCandidate}
        />
      </div>

      <CandidateComparison
        roles={jobRoles}
        companies={companiesWithRoleDirections}
        fits={companyRoleFits}
        candidateRoleIds={candidateRoleIds}
        onRemove={toggleCandidate}
        onClear={clearCandidates}
      />

      <main ref={companiesRef} id="companies" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <FilterBar
          filters={filters}
          sortKey={sortKey}
          categories={categories}
          roles={roles}
          skills={skills}
          resultCount={filteredCompanies.length}
          onFiltersChange={updateFilters}
          onSortChange={updateSort}
          onReset={resetFilters}
        />
        <div className="mt-4">
          <CompanyTable
            companies={filteredCompanies}
            expandedCompanyId={expandedCompanyId}
            onToggleCompany={toggleCompany}
          />
        </div>
      </main>

      <SkillMatrix
        skills={skillDefinitions}
        activeSkill={filters.skill}
        onSkillClick={selectSkill}
      />

      <FooterDisclaimer companies={companiesWithRoleDirections} />
    </div>
  );
}

export default App;
