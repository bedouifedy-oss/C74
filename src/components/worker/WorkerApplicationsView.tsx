'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  MapPin,
  User,
  DollarSign,
  MessageCircle
} from 'lucide-react';

type JobData = {
  id: string;
  description: string;
  category: string;
  address: string;
  address_details?: string;
  price_estimate?: number;
  price_agreed?: number;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
};

type ApplicationsData = {
  applications: JobData[];
  offers: JobData[];
  contracts: JobData[];
  stats: {
    totalApplications: number;
    pendingOffers: number;
    activeContracts: number;
    completedContracts: number;
  };
};

const translations = {
  en: {
    applications: 'Applications',
    offers: 'Job Offers',
    contracts: 'Contracts',
    noApplications: 'No applications yet',
    noOffers: 'No job offers',
    noContracts: 'No contracts',
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    requested: 'Requested',
    cancelled: 'Cancelled',
    price: 'Price',
    location: 'Location',
    customer: 'Customer',
    date: 'Date',
    timeSlot: 'Time',
    contact: 'Contact',
    viewDetails: 'View Details',
    activeContracts: 'Active Contracts',
    completedContracts: 'Completed',
    stats: 'Statistics',
    totalApplications: 'Total Applications',
    pendingOffers: 'Pending Offers'
  },
  fr: {
    applications: 'Candidatures',
    offers: 'Offres d\'emploi',
    contracts: 'Contrats',
    noApplications: 'Aucune candidature',
    noOffers: 'Aucune offre',
    noContracts: 'Aucun contrat',
    pending: 'En attente',
    accepted: 'Accepté',
    in_progress: 'En cours',
    completed: 'Terminé',
    requested: 'Demandé',
    cancelled: 'Annulé',
    price: 'Prix',
    location: 'Lieu',
    customer: 'Client',
    date: 'Date',
    timeSlot: 'Heure',
    contact: 'Contacter',
    viewDetails: 'Voir détails',
    activeContracts: 'Contrats actifs',
    completedContracts: 'Contrats terminés',
    stats: 'Statistiques',
    totalApplications: 'Total des candidatures',
    pendingOffers: 'Offres en attente'
  },
  'ar-TN': {
    applications: 'الطلبات',
    offers: 'عروض العمل',
    contracts: 'العقود',
    noApplications: 'لا توجد طلبات',
    noOffers: 'لا توجد عروض عمل',
    noContracts: 'لا توجد عقود',
    pending: 'في الانتظار',
    accepted: 'مقبول',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    requested: 'مطلوب',
    cancelled: 'ملغي',
    price: 'السعر',
    location: 'الموقع',
    customer: 'العميل',
    date: 'التاريخ',
    timeSlot: 'الوقت',
    contact: 'التواصل',
    viewDetails: 'عرض التفاصيل',
    activeContracts: 'العقود النشطة',
    completedContracts: 'العقود المكتملة',
    stats: 'الإحصائيات',
    totalApplications: 'إجمالي الطلبات',
    pendingOffers: 'عروض العمل في الانتظار'
  }
};

export default function WorkerApplicationsView() {
  const { locale, setLocale, isClient } = useLocale();
  const t = translations[locale];
  
  const [data, setData] = useState<ApplicationsData>({
    applications: [],
    offers: [],
    contracts: [],
    stats: {
      totalApplications: 0,
      pendingOffers: 0,
      activeContracts: 0,
      completedContracts: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isClient) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/workers/applications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isClient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'requested':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      case 'accepted':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return t[status as keyof typeof t] || status;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'ar-TN' ? 'ar-TN' : locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  const JobCard = ({ job, type }: { job: JobData; type: 'application' | 'offer' | 'contract' }) => (
    <Card key={job.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.description}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{job.category}</Badge>
              <Badge className={getStatusColor(job.status)}>
                {getStatusLabel(job.status)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <MapPin className="w-4 h-4" />
            <span>{job.address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <User className="w-4 h-4" />
            <span>{t.customer}: {job.customer.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <span>{t.date}: {formatDate(job.created_at)}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-primary-600 dark:text-primary-400">
                {job.price_agreed ? formatPrice(job.price_agreed) : 
                 job.price_estimate ? formatPrice(job.price_estimate) : t.price}
              </div>
            </div>
          </div>

          {job.scheduled_date && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Calendar className="w-4 h-4" />
              <span>{t.date}: {formatDate(job.scheduled_date)}</span>
              {job.scheduled_time_slot && (
                <span className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                  {job.scheduled_time_slot}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm">
              {t.viewDetails}
            </Button>
            <Button size="sm">
              {t.contact}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.totalApplications}</p>
                <p className="text-2xl font-bold">{data.stats.totalApplications}</p>
              </div>
              <Briefcase className="w-8 h-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.pendingOffers}</p>
                <p className="text-2xl font-bold">{data.stats.pendingOffers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.activeContracts}</p>
                <p className="text-2xl font-bold">{data.stats.activeContracts}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.completedContracts}</p>
                <p className="text-2xl font-bold">{data.stats.completedContracts}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Offers */}
      <Card>
        <CardHeader>
          <CardTitle>{t.offers}</CardTitle>
          <CardDescription>{t.pendingOffers}: {data.stats.pendingOffers}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.offers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t.noOffers}</p>
            </div>
          ) : (
            <div>
              {data.offers.map((job) => (
                <JobCard key={job.id} job={job} type="offer" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>{t.contracts}</CardTitle>
          <CardDescription>
            {t.activeContracts}: {data.stats.activeContracts} | {t.completedContracts}: {data.stats.completedContracts}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.contracts.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t.noContracts}</p>
            </div>
          ) : (
            <div>
              {data.contracts.map((job) => (
                <JobCard key={job.id} job={job} type="contract" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
