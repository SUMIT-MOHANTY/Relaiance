# Frontend Tree Structure

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── vite-env.d.ts
    ├── components/
    │   ├── admin/
    │   │   ├── AddConfigDrawer.tsx
    │   │   ├── ConfigurationTable.tsx
    │   │   ├── ConfirmDeactivateDialog.tsx
    │   │   ├── CreateUserDrawer.tsx
    │   │   ├── EditUserDrawer.tsx
    │   │   ├── TypedConfirmationDialog.tsx
    │   │   └── UserTable.tsx
    │   ├── agent/
    │   │   ├── AgentActionCard.tsx
    │   │   ├── AgentActions.tsx
    │   │   ├── CreateAgentActionDrawer.tsx
    │   │   └── RejectReasonDialog.tsx
    │   ├── common/
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── RoleRoute.tsx
    │   │   └── ToastProvider.tsx
    │   ├── dashboard/
    │   │   └── ExecutiveDashboard.tsx
    │   ├── initiatives/
    │   │   ├── AdoptionSignalTab.tsx
    │   │   ├── BenefitTab.tsx
    │   │   ├── DecisionTab.tsx
    │   │   ├── DependencyGraph.tsx
    │   │   ├── MilestoneTab.tsx
    │   │   ├── NewInitiativeDrawer.tsx
    │   │   ├── PortfolioOverview.tsx
    │   │   └── RiskTab.tsx
    │   ├── layout/
    │   │   └── AppLayout.tsx
    │   ├── reporting/
    │   │   └── BlockedWork.tsx
    │   ├── risks/
    │   │   ├── BlockedWorkPanel.tsx
    │   │   ├── RiskTable.tsx
    │   │   └── SubmitDecisionModal.tsx
    │   ├── shared/
    │   │   └── NotificationBanner.tsx
    │   └── team/
    │       ├── ApprovalsTab.tsx
    │       ├── EvidenceUploadTab.tsx
    │       ├── InitiativeCard.tsx
    │       └── MilestoneUpdateTab.tsx
    ├── config/
    │   ├── env.ts
    │   └── theme.ts
    ├── hooks/
    │   └── useInitiatives.tsx
    ├── mocks/
    │   └── mockData.ts
    ├── pages/
    │   ├── admin/
    │   │   ├── AdminPanel.tsx
    │   │   ├── AuditLogPage.tsx
    │   │   ├── ConfigurationPage.tsx
    │   │   ├── DataManagementPage.tsx
    │   │   ├── UserManagementPage.tsx
    │   │   └── test.md
    │   ├── auth/
    │   │   └── LoginPage.tsx
    │   ├── errors/
    │   │   └── ForbiddenPage.tsx
    │   ├── AgentActionsPage.tsx
    │   ├── InitiativeDetailPage.tsx
    │   ├── PortfolioDashboardPage.tsx
    │   ├── RisksBlockersPage.tsx
    │   └── TeamDashboardPage.tsx
    ├── services/
    │   ├── admin.api.ts
    │   ├── agent.api.ts
    │   ├── apiClient.ts
    │   ├── auth.api.ts
    │   ├── initiative.api.ts
    │   └── reporting.api.ts
    ├── store/
    │   ├── authStore.ts
    │   └── notificationStore.ts
    ├── types/
    │   └── api.types.ts
    └── utils/
        └── formatters.tsx
```

## Summary

- **Total Files**: 91
- **Frontend Source**: `/workspace/frontend/src/`
- **Main Entry**: `frontend/src/main.tsx`
- **App Root**: `frontend/src/App.tsx`
- **Admin Pages**: `frontend/src/pages/admin/`
- **Admin Components**: `frontend/src/components/admin/`
- **Services**: `frontend/src/services/`
- **Types**: `frontend/src/types/`
