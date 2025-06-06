/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SupportImport } from './routes/support'
import { Route as ResetPasswordImport } from './routes/reset-password'
import { Route as RegisterImport } from './routes/register'
import { Route as LoginImport } from './routes/login'
import { Route as ForgotPasswordImport } from './routes/forgot-password'
import { Route as AuthenticatedImport } from './routes/_authenticated'
import { Route as R500Import } from './routes/500'
import { Route as R404Import } from './routes/404'
import { Route as R403Import } from './routes/403'
import { Route as IndexImport } from './routes/index'
import { Route as AuthenticatedTransactionsImport } from './routes/_authenticated/transactions'
import { Route as AuthenticatedSubscriptionsImport } from './routes/_authenticated/subscriptions'
import { Route as AuthenticatedStatisticsImport } from './routes/_authenticated/statistics'
import { Route as AuthenticatedReviewsImport } from './routes/_authenticated/reviews'
import { Route as AuthenticatedRecurringImport } from './routes/_authenticated/recurring'
import { Route as AuthenticatedProfileImport } from './routes/_authenticated/profile'
import { Route as AuthenticatedPaymentsImport } from './routes/_authenticated/payments'
import { Route as AuthenticatedNotificationsImport } from './routes/_authenticated/notifications'
import { Route as AuthenticatedHistoryImport } from './routes/_authenticated/history'
import { Route as AuthenticatedDashboardImport } from './routes/_authenticated/dashboard'
import { Route as AuthenticatedCategoriesImport } from './routes/_authenticated/categories'
import { Route as AuthenticatedProjectsIndexImport } from './routes/_authenticated/projects/index'
import { Route as AuthenticatedInvestmentsIndexImport } from './routes/_authenticated/investments/index'
import { Route as AuthenticatedBudgetsIndexImport } from './routes/_authenticated/budgets/index'
import { Route as AuthenticatedProjectsNewImport } from './routes/_authenticated/projects/new'
import { Route as AuthenticatedProjectsProjectIdImport } from './routes/_authenticated/projects/$projectId'
import { Route as AuthenticatedInvestmentsNewImport } from './routes/_authenticated/investments/new'
import { Route as AuthenticatedInvestmentsInvestmentIdImport } from './routes/_authenticated/investments/$investmentId'
import { Route as AuthenticatedBudgetsNewImport } from './routes/_authenticated/budgets/new'
import { Route as AuthenticatedBudgetsBudgetIdImport } from './routes/_authenticated/budgets/$budgetId'
import { Route as AuthenticatedAdminUsersImport } from './routes/_authenticated/admin/users'
import { Route as AuthenticatedAdminCategoriesImport } from './routes/_authenticated/admin/categories'
import { Route as AuthenticatedProjectsEditProjectIdImport } from './routes/_authenticated/projects/edit.$projectId'
import { Route as AuthenticatedInvestmentsEditInvestmentIdImport } from './routes/_authenticated/investments/edit.$investmentId'
import { Route as AuthenticatedBudgetsEditBudgetIdImport } from './routes/_authenticated/budgets/edit.$budgetId'
import { Route as AuthenticatedAdminUsersUserIdImport } from './routes/_authenticated/admin/users_.$userId'

// Create/Update Routes

const SupportRoute = SupportImport.update({
  id: '/support',
  path: '/support',
  getParentRoute: () => rootRoute,
} as any)

const ResetPasswordRoute = ResetPasswordImport.update({
  id: '/reset-password',
  path: '/reset-password',
  getParentRoute: () => rootRoute,
} as any)

const RegisterRoute = RegisterImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const ForgotPasswordRoute = ForgotPasswordImport.update({
  id: '/forgot-password',
  path: '/forgot-password',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedRoute = AuthenticatedImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRoute,
} as any)

const R500Route = R500Import.update({
  id: '/500',
  path: '/500',
  getParentRoute: () => rootRoute,
} as any)

const R404Route = R404Import.update({
  id: '/404',
  path: '/404',
  getParentRoute: () => rootRoute,
} as any)

const R403Route = R403Import.update({
  id: '/403',
  path: '/403',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedTransactionsRoute = AuthenticatedTransactionsImport.update({
  id: '/transactions',
  path: '/transactions',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedSubscriptionsRoute = AuthenticatedSubscriptionsImport.update(
  {
    id: '/subscriptions',
    path: '/subscriptions',
    getParentRoute: () => AuthenticatedRoute,
  } as any,
)

const AuthenticatedStatisticsRoute = AuthenticatedStatisticsImport.update({
  id: '/statistics',
  path: '/statistics',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedReviewsRoute = AuthenticatedReviewsImport.update({
  id: '/reviews',
  path: '/reviews',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedRecurringRoute = AuthenticatedRecurringImport.update({
  id: '/recurring',
  path: '/recurring',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedProfileRoute = AuthenticatedProfileImport.update({
  id: '/profile',
  path: '/profile',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedPaymentsRoute = AuthenticatedPaymentsImport.update({
  id: '/payments',
  path: '/payments',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedNotificationsRoute = AuthenticatedNotificationsImport.update(
  {
    id: '/notifications',
    path: '/notifications',
    getParentRoute: () => AuthenticatedRoute,
  } as any,
)

const AuthenticatedHistoryRoute = AuthenticatedHistoryImport.update({
  id: '/history',
  path: '/history',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedDashboardRoute = AuthenticatedDashboardImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedCategoriesRoute = AuthenticatedCategoriesImport.update({
  id: '/categories',
  path: '/categories',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedProjectsIndexRoute = AuthenticatedProjectsIndexImport.update(
  {
    id: '/projects/',
    path: '/projects/',
    getParentRoute: () => AuthenticatedRoute,
  } as any,
)

const AuthenticatedInvestmentsIndexRoute =
  AuthenticatedInvestmentsIndexImport.update({
    id: '/investments/',
    path: '/investments/',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedBudgetsIndexRoute = AuthenticatedBudgetsIndexImport.update({
  id: '/budgets/',
  path: '/budgets/',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedProjectsNewRoute = AuthenticatedProjectsNewImport.update({
  id: '/projects/new',
  path: '/projects/new',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedProjectsProjectIdRoute =
  AuthenticatedProjectsProjectIdImport.update({
    id: '/projects/$projectId',
    path: '/projects/$projectId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedInvestmentsNewRoute =
  AuthenticatedInvestmentsNewImport.update({
    id: '/investments/new',
    path: '/investments/new',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedInvestmentsInvestmentIdRoute =
  AuthenticatedInvestmentsInvestmentIdImport.update({
    id: '/investments/$investmentId',
    path: '/investments/$investmentId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedBudgetsNewRoute = AuthenticatedBudgetsNewImport.update({
  id: '/budgets/new',
  path: '/budgets/new',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedBudgetsBudgetIdRoute =
  AuthenticatedBudgetsBudgetIdImport.update({
    id: '/budgets/$budgetId',
    path: '/budgets/$budgetId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedAdminUsersRoute = AuthenticatedAdminUsersImport.update({
  id: '/admin/users',
  path: '/admin/users',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedAdminCategoriesRoute =
  AuthenticatedAdminCategoriesImport.update({
    id: '/admin/categories',
    path: '/admin/categories',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedProjectsEditProjectIdRoute =
  AuthenticatedProjectsEditProjectIdImport.update({
    id: '/projects/edit/$projectId',
    path: '/projects/edit/$projectId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedInvestmentsEditInvestmentIdRoute =
  AuthenticatedInvestmentsEditInvestmentIdImport.update({
    id: '/investments/edit/$investmentId',
    path: '/investments/edit/$investmentId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedBudgetsEditBudgetIdRoute =
  AuthenticatedBudgetsEditBudgetIdImport.update({
    id: '/budgets/edit/$budgetId',
    path: '/budgets/edit/$budgetId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedAdminUsersUserIdRoute =
  AuthenticatedAdminUsersUserIdImport.update({
    id: '/admin/users_/$userId',
    path: '/admin/users/$userId',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/403': {
      id: '/403'
      path: '/403'
      fullPath: '/403'
      preLoaderRoute: typeof R403Import
      parentRoute: typeof rootRoute
    }
    '/404': {
      id: '/404'
      path: '/404'
      fullPath: '/404'
      preLoaderRoute: typeof R404Import
      parentRoute: typeof rootRoute
    }
    '/500': {
      id: '/500'
      path: '/500'
      fullPath: '/500'
      preLoaderRoute: typeof R500Import
      parentRoute: typeof rootRoute
    }
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthenticatedImport
      parentRoute: typeof rootRoute
    }
    '/forgot-password': {
      id: '/forgot-password'
      path: '/forgot-password'
      fullPath: '/forgot-password'
      preLoaderRoute: typeof ForgotPasswordImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/reset-password': {
      id: '/reset-password'
      path: '/reset-password'
      fullPath: '/reset-password'
      preLoaderRoute: typeof ResetPasswordImport
      parentRoute: typeof rootRoute
    }
    '/support': {
      id: '/support'
      path: '/support'
      fullPath: '/support'
      preLoaderRoute: typeof SupportImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/categories': {
      id: '/_authenticated/categories'
      path: '/categories'
      fullPath: '/categories'
      preLoaderRoute: typeof AuthenticatedCategoriesImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/dashboard': {
      id: '/_authenticated/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof AuthenticatedDashboardImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/history': {
      id: '/_authenticated/history'
      path: '/history'
      fullPath: '/history'
      preLoaderRoute: typeof AuthenticatedHistoryImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/notifications': {
      id: '/_authenticated/notifications'
      path: '/notifications'
      fullPath: '/notifications'
      preLoaderRoute: typeof AuthenticatedNotificationsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/payments': {
      id: '/_authenticated/payments'
      path: '/payments'
      fullPath: '/payments'
      preLoaderRoute: typeof AuthenticatedPaymentsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/profile': {
      id: '/_authenticated/profile'
      path: '/profile'
      fullPath: '/profile'
      preLoaderRoute: typeof AuthenticatedProfileImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/recurring': {
      id: '/_authenticated/recurring'
      path: '/recurring'
      fullPath: '/recurring'
      preLoaderRoute: typeof AuthenticatedRecurringImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/reviews': {
      id: '/_authenticated/reviews'
      path: '/reviews'
      fullPath: '/reviews'
      preLoaderRoute: typeof AuthenticatedReviewsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/statistics': {
      id: '/_authenticated/statistics'
      path: '/statistics'
      fullPath: '/statistics'
      preLoaderRoute: typeof AuthenticatedStatisticsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/subscriptions': {
      id: '/_authenticated/subscriptions'
      path: '/subscriptions'
      fullPath: '/subscriptions'
      preLoaderRoute: typeof AuthenticatedSubscriptionsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/transactions': {
      id: '/_authenticated/transactions'
      path: '/transactions'
      fullPath: '/transactions'
      preLoaderRoute: typeof AuthenticatedTransactionsImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/admin/categories': {
      id: '/_authenticated/admin/categories'
      path: '/admin/categories'
      fullPath: '/admin/categories'
      preLoaderRoute: typeof AuthenticatedAdminCategoriesImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/admin/users': {
      id: '/_authenticated/admin/users'
      path: '/admin/users'
      fullPath: '/admin/users'
      preLoaderRoute: typeof AuthenticatedAdminUsersImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/budgets/$budgetId': {
      id: '/_authenticated/budgets/$budgetId'
      path: '/budgets/$budgetId'
      fullPath: '/budgets/$budgetId'
      preLoaderRoute: typeof AuthenticatedBudgetsBudgetIdImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/budgets/new': {
      id: '/_authenticated/budgets/new'
      path: '/budgets/new'
      fullPath: '/budgets/new'
      preLoaderRoute: typeof AuthenticatedBudgetsNewImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/investments/$investmentId': {
      id: '/_authenticated/investments/$investmentId'
      path: '/investments/$investmentId'
      fullPath: '/investments/$investmentId'
      preLoaderRoute: typeof AuthenticatedInvestmentsInvestmentIdImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/investments/new': {
      id: '/_authenticated/investments/new'
      path: '/investments/new'
      fullPath: '/investments/new'
      preLoaderRoute: typeof AuthenticatedInvestmentsNewImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/projects/$projectId': {
      id: '/_authenticated/projects/$projectId'
      path: '/projects/$projectId'
      fullPath: '/projects/$projectId'
      preLoaderRoute: typeof AuthenticatedProjectsProjectIdImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/projects/new': {
      id: '/_authenticated/projects/new'
      path: '/projects/new'
      fullPath: '/projects/new'
      preLoaderRoute: typeof AuthenticatedProjectsNewImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/budgets/': {
      id: '/_authenticated/budgets/'
      path: '/budgets'
      fullPath: '/budgets'
      preLoaderRoute: typeof AuthenticatedBudgetsIndexImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/investments/': {
      id: '/_authenticated/investments/'
      path: '/investments'
      fullPath: '/investments'
      preLoaderRoute: typeof AuthenticatedInvestmentsIndexImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/projects/': {
      id: '/_authenticated/projects/'
      path: '/projects'
      fullPath: '/projects'
      preLoaderRoute: typeof AuthenticatedProjectsIndexImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/admin/users_/$userId': {
      id: '/_authenticated/admin/users_/$userId'
      path: '/admin/users/$userId'
      fullPath: '/admin/users/$userId'
      preLoaderRoute: typeof AuthenticatedAdminUsersUserIdImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/budgets/edit/$budgetId': {
      id: '/_authenticated/budgets/edit/$budgetId'
      path: '/budgets/edit/$budgetId'
      fullPath: '/budgets/edit/$budgetId'
      preLoaderRoute: typeof AuthenticatedBudgetsEditBudgetIdImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/investments/edit/$investmentId': {
      id: '/_authenticated/investments/edit/$investmentId'
      path: '/investments/edit/$investmentId'
      fullPath: '/investments/edit/$investmentId'
      preLoaderRoute: typeof AuthenticatedInvestmentsEditInvestmentIdImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/projects/edit/$projectId': {
      id: '/_authenticated/projects/edit/$projectId'
      path: '/projects/edit/$projectId'
      fullPath: '/projects/edit/$projectId'
      preLoaderRoute: typeof AuthenticatedProjectsEditProjectIdImport
      parentRoute: typeof AuthenticatedImport
    }
  }
}

// Create and export the route tree

interface AuthenticatedRouteChildren {
  AuthenticatedCategoriesRoute: typeof AuthenticatedCategoriesRoute
  AuthenticatedDashboardRoute: typeof AuthenticatedDashboardRoute
  AuthenticatedHistoryRoute: typeof AuthenticatedHistoryRoute
  AuthenticatedNotificationsRoute: typeof AuthenticatedNotificationsRoute
  AuthenticatedPaymentsRoute: typeof AuthenticatedPaymentsRoute
  AuthenticatedProfileRoute: typeof AuthenticatedProfileRoute
  AuthenticatedRecurringRoute: typeof AuthenticatedRecurringRoute
  AuthenticatedReviewsRoute: typeof AuthenticatedReviewsRoute
  AuthenticatedStatisticsRoute: typeof AuthenticatedStatisticsRoute
  AuthenticatedSubscriptionsRoute: typeof AuthenticatedSubscriptionsRoute
  AuthenticatedTransactionsRoute: typeof AuthenticatedTransactionsRoute
  AuthenticatedAdminCategoriesRoute: typeof AuthenticatedAdminCategoriesRoute
  AuthenticatedAdminUsersRoute: typeof AuthenticatedAdminUsersRoute
  AuthenticatedBudgetsBudgetIdRoute: typeof AuthenticatedBudgetsBudgetIdRoute
  AuthenticatedBudgetsNewRoute: typeof AuthenticatedBudgetsNewRoute
  AuthenticatedInvestmentsInvestmentIdRoute: typeof AuthenticatedInvestmentsInvestmentIdRoute
  AuthenticatedInvestmentsNewRoute: typeof AuthenticatedInvestmentsNewRoute
  AuthenticatedProjectsProjectIdRoute: typeof AuthenticatedProjectsProjectIdRoute
  AuthenticatedProjectsNewRoute: typeof AuthenticatedProjectsNewRoute
  AuthenticatedBudgetsIndexRoute: typeof AuthenticatedBudgetsIndexRoute
  AuthenticatedInvestmentsIndexRoute: typeof AuthenticatedInvestmentsIndexRoute
  AuthenticatedProjectsIndexRoute: typeof AuthenticatedProjectsIndexRoute
  AuthenticatedAdminUsersUserIdRoute: typeof AuthenticatedAdminUsersUserIdRoute
  AuthenticatedBudgetsEditBudgetIdRoute: typeof AuthenticatedBudgetsEditBudgetIdRoute
  AuthenticatedInvestmentsEditInvestmentIdRoute: typeof AuthenticatedInvestmentsEditInvestmentIdRoute
  AuthenticatedProjectsEditProjectIdRoute: typeof AuthenticatedProjectsEditProjectIdRoute
}

const AuthenticatedRouteChildren: AuthenticatedRouteChildren = {
  AuthenticatedCategoriesRoute: AuthenticatedCategoriesRoute,
  AuthenticatedDashboardRoute: AuthenticatedDashboardRoute,
  AuthenticatedHistoryRoute: AuthenticatedHistoryRoute,
  AuthenticatedNotificationsRoute: AuthenticatedNotificationsRoute,
  AuthenticatedPaymentsRoute: AuthenticatedPaymentsRoute,
  AuthenticatedProfileRoute: AuthenticatedProfileRoute,
  AuthenticatedRecurringRoute: AuthenticatedRecurringRoute,
  AuthenticatedReviewsRoute: AuthenticatedReviewsRoute,
  AuthenticatedStatisticsRoute: AuthenticatedStatisticsRoute,
  AuthenticatedSubscriptionsRoute: AuthenticatedSubscriptionsRoute,
  AuthenticatedTransactionsRoute: AuthenticatedTransactionsRoute,
  AuthenticatedAdminCategoriesRoute: AuthenticatedAdminCategoriesRoute,
  AuthenticatedAdminUsersRoute: AuthenticatedAdminUsersRoute,
  AuthenticatedBudgetsBudgetIdRoute: AuthenticatedBudgetsBudgetIdRoute,
  AuthenticatedBudgetsNewRoute: AuthenticatedBudgetsNewRoute,
  AuthenticatedInvestmentsInvestmentIdRoute:
    AuthenticatedInvestmentsInvestmentIdRoute,
  AuthenticatedInvestmentsNewRoute: AuthenticatedInvestmentsNewRoute,
  AuthenticatedProjectsProjectIdRoute: AuthenticatedProjectsProjectIdRoute,
  AuthenticatedProjectsNewRoute: AuthenticatedProjectsNewRoute,
  AuthenticatedBudgetsIndexRoute: AuthenticatedBudgetsIndexRoute,
  AuthenticatedInvestmentsIndexRoute: AuthenticatedInvestmentsIndexRoute,
  AuthenticatedProjectsIndexRoute: AuthenticatedProjectsIndexRoute,
  AuthenticatedAdminUsersUserIdRoute: AuthenticatedAdminUsersUserIdRoute,
  AuthenticatedBudgetsEditBudgetIdRoute: AuthenticatedBudgetsEditBudgetIdRoute,
  AuthenticatedInvestmentsEditInvestmentIdRoute:
    AuthenticatedInvestmentsEditInvestmentIdRoute,
  AuthenticatedProjectsEditProjectIdRoute:
    AuthenticatedProjectsEditProjectIdRoute,
}

const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/403': typeof R403Route
  '/404': typeof R404Route
  '/500': typeof R500Route
  '': typeof AuthenticatedRouteWithChildren
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
  '/support': typeof SupportRoute
  '/categories': typeof AuthenticatedCategoriesRoute
  '/dashboard': typeof AuthenticatedDashboardRoute
  '/history': typeof AuthenticatedHistoryRoute
  '/notifications': typeof AuthenticatedNotificationsRoute
  '/payments': typeof AuthenticatedPaymentsRoute
  '/profile': typeof AuthenticatedProfileRoute
  '/recurring': typeof AuthenticatedRecurringRoute
  '/reviews': typeof AuthenticatedReviewsRoute
  '/statistics': typeof AuthenticatedStatisticsRoute
  '/subscriptions': typeof AuthenticatedSubscriptionsRoute
  '/transactions': typeof AuthenticatedTransactionsRoute
  '/admin/categories': typeof AuthenticatedAdminCategoriesRoute
  '/admin/users': typeof AuthenticatedAdminUsersRoute
  '/budgets/$budgetId': typeof AuthenticatedBudgetsBudgetIdRoute
  '/budgets/new': typeof AuthenticatedBudgetsNewRoute
  '/investments/$investmentId': typeof AuthenticatedInvestmentsInvestmentIdRoute
  '/investments/new': typeof AuthenticatedInvestmentsNewRoute
  '/projects/$projectId': typeof AuthenticatedProjectsProjectIdRoute
  '/projects/new': typeof AuthenticatedProjectsNewRoute
  '/budgets': typeof AuthenticatedBudgetsIndexRoute
  '/investments': typeof AuthenticatedInvestmentsIndexRoute
  '/projects': typeof AuthenticatedProjectsIndexRoute
  '/admin/users/$userId': typeof AuthenticatedAdminUsersUserIdRoute
  '/budgets/edit/$budgetId': typeof AuthenticatedBudgetsEditBudgetIdRoute
  '/investments/edit/$investmentId': typeof AuthenticatedInvestmentsEditInvestmentIdRoute
  '/projects/edit/$projectId': typeof AuthenticatedProjectsEditProjectIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/403': typeof R403Route
  '/404': typeof R404Route
  '/500': typeof R500Route
  '': typeof AuthenticatedRouteWithChildren
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
  '/support': typeof SupportRoute
  '/categories': typeof AuthenticatedCategoriesRoute
  '/dashboard': typeof AuthenticatedDashboardRoute
  '/history': typeof AuthenticatedHistoryRoute
  '/notifications': typeof AuthenticatedNotificationsRoute
  '/payments': typeof AuthenticatedPaymentsRoute
  '/profile': typeof AuthenticatedProfileRoute
  '/recurring': typeof AuthenticatedRecurringRoute
  '/reviews': typeof AuthenticatedReviewsRoute
  '/statistics': typeof AuthenticatedStatisticsRoute
  '/subscriptions': typeof AuthenticatedSubscriptionsRoute
  '/transactions': typeof AuthenticatedTransactionsRoute
  '/admin/categories': typeof AuthenticatedAdminCategoriesRoute
  '/admin/users': typeof AuthenticatedAdminUsersRoute
  '/budgets/$budgetId': typeof AuthenticatedBudgetsBudgetIdRoute
  '/budgets/new': typeof AuthenticatedBudgetsNewRoute
  '/investments/$investmentId': typeof AuthenticatedInvestmentsInvestmentIdRoute
  '/investments/new': typeof AuthenticatedInvestmentsNewRoute
  '/projects/$projectId': typeof AuthenticatedProjectsProjectIdRoute
  '/projects/new': typeof AuthenticatedProjectsNewRoute
  '/budgets': typeof AuthenticatedBudgetsIndexRoute
  '/investments': typeof AuthenticatedInvestmentsIndexRoute
  '/projects': typeof AuthenticatedProjectsIndexRoute
  '/admin/users/$userId': typeof AuthenticatedAdminUsersUserIdRoute
  '/budgets/edit/$budgetId': typeof AuthenticatedBudgetsEditBudgetIdRoute
  '/investments/edit/$investmentId': typeof AuthenticatedInvestmentsEditInvestmentIdRoute
  '/projects/edit/$projectId': typeof AuthenticatedProjectsEditProjectIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/403': typeof R403Route
  '/404': typeof R404Route
  '/500': typeof R500Route
  '/_authenticated': typeof AuthenticatedRouteWithChildren
  '/forgot-password': typeof ForgotPasswordRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/reset-password': typeof ResetPasswordRoute
  '/support': typeof SupportRoute
  '/_authenticated/categories': typeof AuthenticatedCategoriesRoute
  '/_authenticated/dashboard': typeof AuthenticatedDashboardRoute
  '/_authenticated/history': typeof AuthenticatedHistoryRoute
  '/_authenticated/notifications': typeof AuthenticatedNotificationsRoute
  '/_authenticated/payments': typeof AuthenticatedPaymentsRoute
  '/_authenticated/profile': typeof AuthenticatedProfileRoute
  '/_authenticated/recurring': typeof AuthenticatedRecurringRoute
  '/_authenticated/reviews': typeof AuthenticatedReviewsRoute
  '/_authenticated/statistics': typeof AuthenticatedStatisticsRoute
  '/_authenticated/subscriptions': typeof AuthenticatedSubscriptionsRoute
  '/_authenticated/transactions': typeof AuthenticatedTransactionsRoute
  '/_authenticated/admin/categories': typeof AuthenticatedAdminCategoriesRoute
  '/_authenticated/admin/users': typeof AuthenticatedAdminUsersRoute
  '/_authenticated/budgets/$budgetId': typeof AuthenticatedBudgetsBudgetIdRoute
  '/_authenticated/budgets/new': typeof AuthenticatedBudgetsNewRoute
  '/_authenticated/investments/$investmentId': typeof AuthenticatedInvestmentsInvestmentIdRoute
  '/_authenticated/investments/new': typeof AuthenticatedInvestmentsNewRoute
  '/_authenticated/projects/$projectId': typeof AuthenticatedProjectsProjectIdRoute
  '/_authenticated/projects/new': typeof AuthenticatedProjectsNewRoute
  '/_authenticated/budgets/': typeof AuthenticatedBudgetsIndexRoute
  '/_authenticated/investments/': typeof AuthenticatedInvestmentsIndexRoute
  '/_authenticated/projects/': typeof AuthenticatedProjectsIndexRoute
  '/_authenticated/admin/users_/$userId': typeof AuthenticatedAdminUsersUserIdRoute
  '/_authenticated/budgets/edit/$budgetId': typeof AuthenticatedBudgetsEditBudgetIdRoute
  '/_authenticated/investments/edit/$investmentId': typeof AuthenticatedInvestmentsEditInvestmentIdRoute
  '/_authenticated/projects/edit/$projectId': typeof AuthenticatedProjectsEditProjectIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/403'
    | '/404'
    | '/500'
    | ''
    | '/forgot-password'
    | '/login'
    | '/register'
    | '/reset-password'
    | '/support'
    | '/categories'
    | '/dashboard'
    | '/history'
    | '/notifications'
    | '/payments'
    | '/profile'
    | '/recurring'
    | '/reviews'
    | '/statistics'
    | '/subscriptions'
    | '/transactions'
    | '/admin/categories'
    | '/admin/users'
    | '/budgets/$budgetId'
    | '/budgets/new'
    | '/investments/$investmentId'
    | '/investments/new'
    | '/projects/$projectId'
    | '/projects/new'
    | '/budgets'
    | '/investments'
    | '/projects'
    | '/admin/users/$userId'
    | '/budgets/edit/$budgetId'
    | '/investments/edit/$investmentId'
    | '/projects/edit/$projectId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/403'
    | '/404'
    | '/500'
    | ''
    | '/forgot-password'
    | '/login'
    | '/register'
    | '/reset-password'
    | '/support'
    | '/categories'
    | '/dashboard'
    | '/history'
    | '/notifications'
    | '/payments'
    | '/profile'
    | '/recurring'
    | '/reviews'
    | '/statistics'
    | '/subscriptions'
    | '/transactions'
    | '/admin/categories'
    | '/admin/users'
    | '/budgets/$budgetId'
    | '/budgets/new'
    | '/investments/$investmentId'
    | '/investments/new'
    | '/projects/$projectId'
    | '/projects/new'
    | '/budgets'
    | '/investments'
    | '/projects'
    | '/admin/users/$userId'
    | '/budgets/edit/$budgetId'
    | '/investments/edit/$investmentId'
    | '/projects/edit/$projectId'
  id:
    | '__root__'
    | '/'
    | '/403'
    | '/404'
    | '/500'
    | '/_authenticated'
    | '/forgot-password'
    | '/login'
    | '/register'
    | '/reset-password'
    | '/support'
    | '/_authenticated/categories'
    | '/_authenticated/dashboard'
    | '/_authenticated/history'
    | '/_authenticated/notifications'
    | '/_authenticated/payments'
    | '/_authenticated/profile'
    | '/_authenticated/recurring'
    | '/_authenticated/reviews'
    | '/_authenticated/statistics'
    | '/_authenticated/subscriptions'
    | '/_authenticated/transactions'
    | '/_authenticated/admin/categories'
    | '/_authenticated/admin/users'
    | '/_authenticated/budgets/$budgetId'
    | '/_authenticated/budgets/new'
    | '/_authenticated/investments/$investmentId'
    | '/_authenticated/investments/new'
    | '/_authenticated/projects/$projectId'
    | '/_authenticated/projects/new'
    | '/_authenticated/budgets/'
    | '/_authenticated/investments/'
    | '/_authenticated/projects/'
    | '/_authenticated/admin/users_/$userId'
    | '/_authenticated/budgets/edit/$budgetId'
    | '/_authenticated/investments/edit/$investmentId'
    | '/_authenticated/projects/edit/$projectId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  R403Route: typeof R403Route
  R404Route: typeof R404Route
  R500Route: typeof R500Route
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren
  ForgotPasswordRoute: typeof ForgotPasswordRoute
  LoginRoute: typeof LoginRoute
  RegisterRoute: typeof RegisterRoute
  ResetPasswordRoute: typeof ResetPasswordRoute
  SupportRoute: typeof SupportRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  R403Route: R403Route,
  R404Route: R404Route,
  R500Route: R500Route,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  ForgotPasswordRoute: ForgotPasswordRoute,
  LoginRoute: LoginRoute,
  RegisterRoute: RegisterRoute,
  ResetPasswordRoute: ResetPasswordRoute,
  SupportRoute: SupportRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/403",
        "/404",
        "/500",
        "/_authenticated",
        "/forgot-password",
        "/login",
        "/register",
        "/reset-password",
        "/support"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/403": {
      "filePath": "403.tsx"
    },
    "/404": {
      "filePath": "404.tsx"
    },
    "/500": {
      "filePath": "500.tsx"
    },
    "/_authenticated": {
      "filePath": "_authenticated.tsx",
      "children": [
        "/_authenticated/categories",
        "/_authenticated/dashboard",
        "/_authenticated/history",
        "/_authenticated/notifications",
        "/_authenticated/payments",
        "/_authenticated/profile",
        "/_authenticated/recurring",
        "/_authenticated/reviews",
        "/_authenticated/statistics",
        "/_authenticated/subscriptions",
        "/_authenticated/transactions",
        "/_authenticated/admin/categories",
        "/_authenticated/admin/users",
        "/_authenticated/budgets/$budgetId",
        "/_authenticated/budgets/new",
        "/_authenticated/investments/$investmentId",
        "/_authenticated/investments/new",
        "/_authenticated/projects/$projectId",
        "/_authenticated/projects/new",
        "/_authenticated/budgets/",
        "/_authenticated/investments/",
        "/_authenticated/projects/",
        "/_authenticated/admin/users_/$userId",
        "/_authenticated/budgets/edit/$budgetId",
        "/_authenticated/investments/edit/$investmentId",
        "/_authenticated/projects/edit/$projectId"
      ]
    },
    "/forgot-password": {
      "filePath": "forgot-password.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/register": {
      "filePath": "register.tsx"
    },
    "/reset-password": {
      "filePath": "reset-password.tsx"
    },
    "/support": {
      "filePath": "support.tsx"
    },
    "/_authenticated/categories": {
      "filePath": "_authenticated/categories.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/dashboard": {
      "filePath": "_authenticated/dashboard.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/history": {
      "filePath": "_authenticated/history.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/notifications": {
      "filePath": "_authenticated/notifications.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/payments": {
      "filePath": "_authenticated/payments.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/profile": {
      "filePath": "_authenticated/profile.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/recurring": {
      "filePath": "_authenticated/recurring.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/reviews": {
      "filePath": "_authenticated/reviews.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/statistics": {
      "filePath": "_authenticated/statistics.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/subscriptions": {
      "filePath": "_authenticated/subscriptions.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/transactions": {
      "filePath": "_authenticated/transactions.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/admin/categories": {
      "filePath": "_authenticated/admin/categories.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/admin/users": {
      "filePath": "_authenticated/admin/users.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/budgets/$budgetId": {
      "filePath": "_authenticated/budgets/$budgetId.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/budgets/new": {
      "filePath": "_authenticated/budgets/new.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/investments/$investmentId": {
      "filePath": "_authenticated/investments/$investmentId.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/investments/new": {
      "filePath": "_authenticated/investments/new.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/projects/$projectId": {
      "filePath": "_authenticated/projects/$projectId.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/projects/new": {
      "filePath": "_authenticated/projects/new.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/budgets/": {
      "filePath": "_authenticated/budgets/index.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/investments/": {
      "filePath": "_authenticated/investments/index.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/projects/": {
      "filePath": "_authenticated/projects/index.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/admin/users_/$userId": {
      "filePath": "_authenticated/admin/users_.$userId.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/budgets/edit/$budgetId": {
      "filePath": "_authenticated/budgets/edit.$budgetId.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/investments/edit/$investmentId": {
      "filePath": "_authenticated/investments/edit.$investmentId.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/projects/edit/$projectId": {
      "filePath": "_authenticated/projects/edit.$projectId.tsx",
      "parent": "/_authenticated"
    }
  }
}
ROUTE_MANIFEST_END */
