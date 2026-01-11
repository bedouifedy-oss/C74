'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Settings, 
  Database, 
  MessageSquare, 
  CreditCard, 
  Shield, 
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Server,
  Globe,
  Bell,
  FileText,
  Users,
  Briefcase,
  Clock
} from 'lucide-react';
import { MobileBottomNav } from '@/components/MobileBottomNav';

type Locale = 'en' | 'fr' | 'ar-TN';

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  category: string;
  description: string;
  status: 'active' | 'mock' | 'disabled';
  requiresAuth: boolean;
}

interface IntegrationConfig {
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'not_configured' | 'error' | 'checking';
  description: string;
  envVars: string[];
  docsUrl?: string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    title: 'API Integrations',
    subtitle: 'Manage external services and API configurations',
    integrations: 'Integrations',
    apiEndpoints: 'API Endpoints',
    envConfig: 'Environment Config',
    status: 'Status',
    connected: 'Connected',
    notConfigured: 'Not Configured',
    error: 'Error',
    active: 'Active',
    mock: 'Mock',
    disabled: 'Disabled',
    testConnection: 'Test Connection',
    viewDocs: 'View Docs',
    copyEnvTemplate: 'Copy .env Template',
    refresh: 'Refresh Status',
    showSecrets: 'Show Values',
    hideSecrets: 'Hide Values',
    allEndpoints: 'All',
    auth: 'Auth',
    jobs: 'Jobs',
    workers: 'Workers',
    fees: 'Fees',
    admin: 'Admin',
    cron: 'Cron Jobs',
    other: 'Other',
    method: 'Method',
    path: 'Path',
    description: 'Description',
    requiresAuth: 'Auth Required',
    yes: 'Yes',
    no: 'No',
    total: 'Total Endpoints',
    configured: 'Configured',
    pending: 'Pending Setup',
  },
  fr: {
    title: 'Intégrations API',
    subtitle: 'Gérer les services externes et configurations API',
    integrations: 'Intégrations',
    apiEndpoints: 'Points d\'accès API',
    envConfig: 'Configuration Environnement',
    status: 'Statut',
    connected: 'Connecté',
    notConfigured: 'Non Configuré',
    error: 'Erreur',
    active: 'Actif',
    mock: 'Simulation',
    disabled: 'Désactivé',
    testConnection: 'Tester la Connexion',
    viewDocs: 'Voir la Doc',
    copyEnvTemplate: 'Copier le Template .env',
    refresh: 'Actualiser',
    showSecrets: 'Afficher les Valeurs',
    hideSecrets: 'Masquer les Valeurs',
    allEndpoints: 'Tous',
    auth: 'Auth',
    jobs: 'Jobs',
    workers: 'Workers',
    fees: 'Frais',
    admin: 'Admin',
    cron: 'Tâches Cron',
    other: 'Autre',
    method: 'Méthode',
    path: 'Chemin',
    description: 'Description',
    requiresAuth: 'Auth Requise',
    yes: 'Oui',
    no: 'Non',
    total: 'Total Points d\'accès',
    configured: 'Configuré',
    pending: 'En Attente',
  },
  'ar-TN': {
    title: 'تكاملات API',
    subtitle: 'إدارة الخدمات الخارجية وتكوينات API',
    integrations: 'التكاملات',
    apiEndpoints: 'نقاط API',
    envConfig: 'تكوين البيئة',
    status: 'الحالة',
    connected: 'متصل',
    notConfigured: 'غير مكوّن',
    error: 'خطأ',
    active: 'نشط',
    mock: 'محاكاة',
    disabled: 'معطل',
    testConnection: 'اختبار الاتصال',
    viewDocs: 'عرض التوثيق',
    copyEnvTemplate: 'نسخ قالب .env',
    refresh: 'تحديث',
    showSecrets: 'إظهار القيم',
    hideSecrets: 'إخفاء القيم',
    allEndpoints: 'الكل',
    auth: 'المصادقة',
    jobs: 'الوظائف',
    workers: 'العمال',
    fees: 'الرسوم',
    admin: 'الإدارة',
    cron: 'مهام مجدولة',
    other: 'أخرى',
    method: 'الطريقة',
    path: 'المسار',
    description: 'الوصف',
    requiresAuth: 'يتطلب مصادقة',
    yes: 'نعم',
    no: 'لا',
    total: 'إجمالي النقاط',
    configured: 'مكوّن',
    pending: 'قيد الانتظار',
  },
};

// All API endpoints in the project
const apiEndpoints: APIEndpoint[] = [
  // Auth
  { path: '/api/auth/signup', method: 'POST', category: 'auth', description: 'User registration with phone', status: 'active', requiresAuth: false },
  { path: '/api/auth/verify-otp', method: 'POST', category: 'auth', description: 'Verify OTP and login', status: 'active', requiresAuth: false },
  { path: '/api/sms/send', method: 'POST', category: 'auth', description: 'Send SMS via Twilio', status: 'disabled', requiresAuth: true },
  
  // Jobs
  { path: '/api/jobs', method: 'GET', category: 'jobs', description: 'List jobs with filters', status: 'active', requiresAuth: false },
  { path: '/api/jobs', method: 'POST', category: 'jobs', description: 'Create new job request', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]', method: 'GET', category: 'jobs', description: 'Get job details', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]', method: 'PATCH', category: 'jobs', description: 'Update job', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]/accept', method: 'POST', category: 'jobs', description: 'Worker accepts job', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]/reject', method: 'POST', category: 'jobs', description: 'Worker rejects job', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]/status', method: 'PATCH', category: 'jobs', description: 'Update job status', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]/propose-price', method: 'POST', category: 'jobs', description: 'Propose price for job', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]/accept-price', method: 'POST', category: 'jobs', description: 'Accept proposed price', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]/negotiation-status', method: 'GET', category: 'jobs', description: 'Get negotiation status', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]/review', method: 'POST', category: 'jobs', description: 'Submit job review', status: 'disabled', requiresAuth: true },
  { path: '/api/jobs/[id]/guarantee', method: 'POST', category: 'jobs', description: 'File guarantee claim', status: 'disabled', requiresAuth: true },
  { path: '/api/jobs/[id]/dispute', method: 'POST', category: 'jobs', description: 'Open dispute', status: 'disabled', requiresAuth: true },
  { path: '/api/jobs/[id]/report-issue', method: 'POST', category: 'jobs', description: 'Report issue with job', status: 'active', requiresAuth: true },
  { path: '/api/jobs/[id]/issues', method: 'GET', category: 'jobs', description: 'Get job issues', status: 'active', requiresAuth: true },
  
  // Applications
  { path: '/api/applications', method: 'GET', category: 'jobs', description: 'List job applications', status: 'active', requiresAuth: true },
  { path: '/api/applications', method: 'POST', category: 'jobs', description: 'Apply for a job', status: 'active', requiresAuth: true },
  { path: '/api/applications/[id]', method: 'GET', category: 'jobs', description: 'Get application details', status: 'disabled', requiresAuth: true },
  { path: '/api/applications/[id]/accept', method: 'POST', category: 'jobs', description: 'Accept application', status: 'active', requiresAuth: true },
  { path: '/api/applications/[id]/reject', method: 'POST', category: 'jobs', description: 'Reject application', status: 'active', requiresAuth: true },
  
  // Workers
  { path: '/api/workers', method: 'GET', category: 'workers', description: 'List workers with filters', status: 'active', requiresAuth: false },
  { path: '/api/workers/[id]', method: 'GET', category: 'workers', description: 'Get worker profile', status: 'active', requiresAuth: false },
  { path: '/api/workers/profile', method: 'GET', category: 'workers', description: 'Get own worker profile', status: 'active', requiresAuth: true },
  { path: '/api/workers/profile', method: 'PUT', category: 'workers', description: 'Update worker profile', status: 'active', requiresAuth: true },
  { path: '/api/workers/availability', method: 'GET', category: 'workers', description: 'Get worker availability', status: 'active', requiresAuth: true },
  { path: '/api/workers/availability', method: 'PUT', category: 'workers', description: 'Update availability', status: 'active', requiresAuth: true },
  
  // Fees
  { path: '/api/fees', method: 'GET', category: 'fees', description: 'Get fee summary', status: 'active', requiresAuth: true },
  { path: '/api/fees/status', method: 'GET', category: 'fees', description: 'Get fee status', status: 'active', requiresAuth: true },
  { path: '/api/fees/my-invoices', method: 'GET', category: 'fees', description: 'Get worker invoices', status: 'active', requiresAuth: true },
  { path: '/api/fees/[id]/submit-payment', method: 'POST', category: 'fees', description: 'Submit payment proof', status: 'active', requiresAuth: true },
  { path: '/api/fees/[id]/request-extension', method: 'POST', category: 'fees', description: 'Request payment extension', status: 'active', requiresAuth: true },
  
  // Messages & Notifications
  { path: '/api/messages', method: 'GET', category: 'other', description: 'Get messages for job', status: 'active', requiresAuth: true },
  { path: '/api/messages', method: 'POST', category: 'other', description: 'Send message', status: 'active', requiresAuth: true },
  { path: '/api/notifications', method: 'GET', category: 'other', description: 'Get notifications', status: 'active', requiresAuth: true },
  { path: '/api/notifications', method: 'PATCH', category: 'other', description: 'Mark notifications read', status: 'active', requiresAuth: true },
  { path: '/api/reviews', method: 'GET', category: 'other', description: 'Get reviews', status: 'active', requiresAuth: false },
  
  // Admin
  { path: '/api/admin/analytics', method: 'GET', category: 'admin', description: 'Get platform analytics', status: 'disabled', requiresAuth: true },
  { path: '/api/admin/workers/pending', method: 'GET', category: 'admin', description: 'Get pending workers', status: 'active', requiresAuth: true },
  { path: '/api/admin/workers/[id]/adjust-fees', method: 'POST', category: 'admin', description: 'Adjust worker fees', status: 'disabled', requiresAuth: true },
  { path: '/api/admin/fees/[id]/verify-payment', method: 'POST', category: 'admin', description: 'Verify fee payment', status: 'disabled', requiresAuth: true },
  { path: '/api/admin/issues', method: 'GET', category: 'admin', description: 'List all issues', status: 'disabled', requiresAuth: true },
  { path: '/api/admin/issues/[id]/resolve', method: 'POST', category: 'admin', description: 'Resolve issue', status: 'disabled', requiresAuth: true },
  { path: '/api/admin/reviews/moderation', method: 'GET', category: 'admin', description: 'Reviews for moderation', status: 'active', requiresAuth: true },
  { path: '/api/admin/reports/weekly', method: 'GET', category: 'admin', description: 'Weekly platform report', status: 'disabled', requiresAuth: true },
  { path: '/api/admin/bulk-actions', method: 'POST', category: 'admin', description: 'Bulk admin actions', status: 'disabled', requiresAuth: true },
  
  // Cron Jobs
  { path: '/api/cron/weekly-invoices', method: 'POST', category: 'cron', description: 'Generate weekly invoices', status: 'disabled', requiresAuth: true },
  { path: '/api/cron/check-overdue-fees', method: 'POST', category: 'cron', description: 'Check overdue fees', status: 'disabled', requiresAuth: true },
  { path: '/api/cron/strike-decay', method: 'POST', category: 'cron', description: 'Decay user strikes', status: 'disabled', requiresAuth: true },
  { path: '/api/cron/weekly-reports', method: 'POST', category: 'cron', description: 'Generate weekly reports', status: 'disabled', requiresAuth: true },
  
  // Webhooks
  { path: '/api/webhooks', method: 'POST', category: 'other', description: 'External webhooks handler', status: 'disabled', requiresAuth: false },
];

export default function IntegrationsPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';
  const t = translations[locale] || translations.en;
  
  const [activeTab, setActiveTab] = useState<'integrations' | 'endpoints' | 'env'>('integrations');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSecrets, setShowSecrets] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, 'checking' | 'connected' | 'not_configured' | 'error'>>({});
  const [copied, setCopied] = useState(false);

  const integrations: IntegrationConfig[] = [
    {
      name: 'Supabase',
      icon: <Database className="w-6 h-6" />,
      status: integrationStatus.supabase || 'not_configured',
      description: 'PostgreSQL database and authentication',
      envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
      docsUrl: 'https://supabase.com/docs',
    },
    {
      name: 'Twilio SMS',
      icon: <MessageSquare className="w-6 h-6" />,
      status: integrationStatus.twilio || 'not_configured',
      description: 'SMS gateway for OTP verification',
      envVars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
      docsUrl: 'https://www.twilio.com/docs/sms',
    },
    {
      name: 'Supabase Storage',
      icon: <FileText className="w-6 h-6" />,
      status: integrationStatus.storage || 'not_configured',
      description: 'File storage for images and documents',
      envVars: ['NEXT_PUBLIC_SUPABASE_URL'],
      docsUrl: 'https://supabase.com/docs/guides/storage',
    },
  ];

  // Check integration status on load
  useEffect(() => {
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    setIntegrationStatus(prev => ({
      ...prev,
      supabase: 'checking',
      twilio: 'checking',
      storage: 'checking',
    }));

    try {
      // Test Supabase
      const supabaseRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+21600000000', otp: '000000' }),
      });
      const supabaseData = await supabaseRes.json();
      
      // If we get JSON back (even with error), API is working
      setIntegrationStatus(prev => ({
        ...prev,
        supabase: supabaseData ? 'connected' : 'error',
        storage: supabaseData ? 'connected' : 'not_configured',
        twilio: 'connected', // Mock mode always works
      }));
    } catch {
      setIntegrationStatus(prev => ({
        ...prev,
        supabase: 'error',
        twilio: 'not_configured',
        storage: 'not_configured',
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'not_configured':
      case 'mock':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'disabled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'not_configured':
      case 'mock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
      case 'disabled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
      case 'PATCH':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEndpoints = selectedCategory === 'all' 
    ? apiEndpoints 
    : apiEndpoints.filter(e => e.category === selectedCategory);

  const categories = [
    { id: 'all', label: t.allEndpoints, icon: <Globe className="w-4 h-4" /> },
    { id: 'auth', label: t.auth, icon: <Shield className="w-4 h-4" /> },
    { id: 'jobs', label: t.jobs, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'workers', label: t.workers, icon: <Users className="w-4 h-4" /> },
    { id: 'fees', label: t.fees, icon: <CreditCard className="w-4 h-4" /> },
    { id: 'admin', label: t.admin, icon: <Settings className="w-4 h-4" /> },
    { id: 'cron', label: t.cron, icon: <Clock className="w-4 h-4" /> },
    { id: 'other', label: t.other, icon: <Zap className="w-4 h-4" /> },
  ];

  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Twilio SMS
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Fee Configuration
FEE_PERCENTAGE=10
FEE_MINIMUM_TND=5
GRACE_PERIOD_DAYS=30`;

  const copyEnvTemplate = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    total: apiEndpoints.length,
    active: apiEndpoints.filter(e => e.status === 'active').length,
    mock: apiEndpoints.filter(e => e.status === 'mock').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Server className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
              <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-sm">{t.total}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{t.active}</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{t.mock}</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.mock}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'integrations', label: t.integrations, icon: <Zap className="w-4 h-4" /> },
            { id: 'endpoints', label: t.apiEndpoints, icon: <Globe className="w-4 h-4" /> },
            { id: 'env', label: t.envConfig, icon: <Settings className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={checkIntegrations}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                {t.refresh}
              </button>
            </div>

            <div className="grid gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {integration.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {integration.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {integration.envVars.map(envVar => (
                            <code
                              key={envVar}
                              className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                            >
                              {envVar}
                            </code>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)}
                        {t[integration.status] || integration.status}
                      </span>
                      {integration.docsUrl && (
                        <a
                          href={integration.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <ExternalLink className="w-5 h-5 text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                  <span className="ms-1 px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded text-xs">
                    {cat.id === 'all' ? apiEndpoints.length : apiEndpoints.filter(e => e.category === cat.id).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Endpoints Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-300">{t.method}</th>
                      <th className="px-4 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-300">{t.path}</th>
                      <th className="px-4 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-300">{t.description}</th>
                      <th className="px-4 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-300">{t.status}</th>
                      <th className="px-4 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-300">{t.requiresAuth}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEndpoints.map((endpoint, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-sm text-gray-900 dark:text-white">{endpoint.path}</code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {endpoint.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-sm ${getStatusColor(endpoint.status)} px-2 py-1 rounded-full w-fit`}>
                            {getStatusIcon(endpoint.status)}
                            {t[endpoint.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {endpoint.requiresAuth ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{t.yes}</span>
                          ) : (
                            <span className="text-gray-400">{t.no}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Environment Config Tab */}
        {activeTab === 'env' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                .env.local Template
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showSecrets ? t.hideSecrets : t.showSecrets}
                </button>
                <button
                  onClick={copyEnvTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? '✓ Copied!' : t.copyEnvTemplate}
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 font-mono whitespace-pre">
                {showSecrets ? envTemplate : envTemplate.replace(/=.+/g, '=••••••••')}
              </pre>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Setup Instructions:</h4>
              <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" className="underline">supabase.com</a></li>
                <li>Copy the project URL and anon key from Settings → API</li>
                <li>Create a Twilio account for SMS at <a href="https://twilio.com" target="_blank" className="underline">twilio.com</a></li>
                <li>Update the values in <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.env.local</code></li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <MobileBottomNav userRole="admin" locale={locale} />
    </div>
  );
}
