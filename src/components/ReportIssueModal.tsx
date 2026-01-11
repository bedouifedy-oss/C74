'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  X,
  Upload,
  Loader2,
  CheckCircle,
  RefreshCw,
  Clock,
  Ban,
  DollarSign,
  UserX,
  HelpCircle,
} from 'lucide-react';
import type { Locale } from '@/i18n-routing';

const translations = {
  en: {
    title: 'Report a Problem',
    subtitle: 'Let us know what went wrong',
    
    // Issue types
    selectIssue: 'What type of issue?',
    sameIssue: 'Same problem returned',
    sameIssueDesc: 'The issue I reported before came back',
    newIssue: 'New problem appeared',
    newIssueDesc: 'A different issue occurred after the job',
    qualityIssue: 'Quality concern',
    qualityIssueDesc: 'Work quality is not as expected',
    noShow: 'Worker didn\'t show up',
    noShowDesc: 'Worker missed the scheduled appointment',
    paymentIssue: 'Payment dispute',
    paymentIssueDesc: 'Issue with payment or pricing',
    behaviorIssue: 'Behavior concern',
    behaviorIssueDesc: 'Unprofessional or inappropriate behavior',
    
    // Form
    describeIssue: 'Describe the issue',
    descriptionPlaceholder: 'Please provide details about what happened...',
    uploadEvidence: 'Upload Photos (Optional)',
    uploadDesc: 'Photos help us understand the issue better',
    selectFiles: 'Select Photos',
    
    // Actions
    submit: 'Submit Report',
    submitting: 'Submitting...',
    cancel: 'Cancel',
    
    // Success
    submitted: 'Report Submitted',
    submittedDesc: 'We\'ll review your report and get back to you within 24 hours.',
    done: 'Done',
    
    // Guarantee info
    guaranteeNote: '7-day guarantee: If the same issue returns within 7 days, the worker must fix it for free.',
  },
  fr: {
    title: 'Signaler un Problème',
    subtitle: 'Dites-nous ce qui s\'est passé',
    
    selectIssue: 'Quel type de problème?',
    sameIssue: 'Même problème revenu',
    sameIssueDesc: 'Le problème signalé est revenu',
    newIssue: 'Nouveau problème',
    newIssueDesc: 'Un problème différent est apparu',
    qualityIssue: 'Problème de qualité',
    qualityIssueDesc: 'La qualité du travail n\'est pas satisfaisante',
    noShow: 'Travailleur absent',
    noShowDesc: 'Le travailleur n\'est pas venu',
    paymentIssue: 'Litige de paiement',
    paymentIssueDesc: 'Problème avec le paiement ou le prix',
    behaviorIssue: 'Comportement',
    behaviorIssueDesc: 'Comportement non professionnel',
    
    describeIssue: 'Décrivez le problème',
    descriptionPlaceholder: 'Veuillez fournir des détails sur ce qui s\'est passé...',
    uploadEvidence: 'Télécharger des Photos (Optionnel)',
    uploadDesc: 'Les photos nous aident à comprendre le problème',
    selectFiles: 'Sélectionner des Photos',
    
    submit: 'Envoyer le Rapport',
    submitting: 'Envoi...',
    cancel: 'Annuler',
    
    submitted: 'Rapport Envoyé',
    submittedDesc: 'Nous examinerons votre rapport et vous répondrons dans les 24 heures.',
    done: 'Terminé',
    
    guaranteeNote: 'Garantie 7 jours: Si le même problème revient dans les 7 jours, le travailleur doit le réparer gratuitement.',
  },
  'ar-TN': {
    title: 'الإبلاغ عن مشكلة',
    subtitle: 'قل لنا شصار',
    
    selectIssue: 'شنوة نوع المشكلة؟',
    sameIssue: 'نفس المشكلة رجعت',
    sameIssueDesc: 'المشكلة اللي بلغت عليها رجعت',
    newIssue: 'مشكلة جديدة',
    newIssueDesc: 'مشكلة مختلفة صارت بعد الخدمة',
    qualityIssue: 'مشكلة جودة',
    qualityIssueDesc: 'جودة الخدمة موش كما لازم',
    noShow: 'العامل ما جاش',
    noShowDesc: 'العامل ما جاش في الموعد',
    paymentIssue: 'مشكلة دفع',
    paymentIssueDesc: 'مشكلة في الدفع أو السعر',
    behaviorIssue: 'مشكلة سلوك',
    behaviorIssueDesc: 'سلوك غير محترف',
    
    describeIssue: 'اوصف المشكلة',
    descriptionPlaceholder: 'من فضلك عطينا تفاصيل على اللي صار...',
    uploadEvidence: 'ارفع صور (اختياري)',
    uploadDesc: 'الصور تساعدنا نفهموا المشكلة أكثر',
    selectFiles: 'اختر صور',
    
    submit: 'أرسل البلاغ',
    submitting: 'جاري الإرسال...',
    cancel: 'إلغاء',
    
    submitted: 'تم إرسال البلاغ',
    submittedDesc: 'باش نراجعوا البلاغ ونجاوبوك في 24 ساعة.',
    done: 'تم',
    
    guaranteeNote: 'ضمان 7 أيام: كان نفس المشكلة ترجع في 7 أيام، العامل لازم يصلحها بلاش.',
  },
};

type IssueType = 'same_issue' | 'new_issue' | 'quality' | 'no_show' | 'payment' | 'behavior';

const issueTypes: { key: IssueType; icon: React.ElementType; color: string }[] = [
  { key: 'same_issue', icon: RefreshCw, color: 'bg-amber-100 text-amber-600' },
  { key: 'new_issue', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  { key: 'quality', icon: HelpCircle, color: 'bg-orange-100 text-orange-600' },
  { key: 'no_show', icon: Clock, color: 'bg-purple-100 text-purple-600' },
  { key: 'payment', icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
  { key: 'behavior', icon: UserX, color: 'bg-neutral-100 text-neutral-600' },
];

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  locale: Locale;
  isWithinGuarantee?: boolean; // True if within 7-day window
}

export function ReportIssueModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  locale,
  isWithinGuarantee = true,
}: ReportIssueModalProps) {
  const t = translations[locale];

  const [step, setStep] = useState<'type' | 'details' | 'success'>('type');
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSelectType = (type: IssueType) => {
    setIssueType(type);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!issueType || !description.trim()) return;

    setIsSubmitting(true);

    try {
      // Submit to API
      await fetch(`/api/jobs/${jobId}/report-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          issue_type: issueType,
          description,
          is_guarantee: issueType === 'same_issue' && isWithinGuarantee,
        }),
      });

      setStep('success');
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('type');
    setIssueType(null);
    setDescription('');
    setFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  const getIssueLabel = (key: IssueType) => {
    const map: Record<IssueType, keyof typeof t> = {
      same_issue: 'sameIssue',
      new_issue: 'newIssue',
      quality: 'qualityIssue',
      no_show: 'noShow',
      payment: 'paymentIssue',
      behavior: 'behaviorIssue',
    };
    return t[map[key]];
  };

  const getIssueDesc = (key: IssueType) => {
    const map: Record<IssueType, keyof typeof t> = {
      same_issue: 'sameIssueDesc',
      new_issue: 'newIssueDesc',
      quality: 'qualityIssueDesc',
      no_show: 'noShowDesc',
      payment: 'paymentIssueDesc',
      behavior: 'behaviorIssueDesc',
    };
    return t[map[key]];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className={`flex items-center justify-between`}>
            <div>
              <CardTitle className={`flex items-center gap-2`}>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {t.title}
              </CardTitle>
              <CardDescription>{t.subtitle}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Select Issue Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <p className="font-medium">{t.selectIssue}</p>

              {/* Guarantee Note */}
              {isWithinGuarantee && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="w-4 h-4 inline me-1" />
                    {t.guaranteeNote}
                  </p>
                </div>
              )}

              <div className="grid gap-3">
                {issueTypes.map(({ key, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => handleSelectType(key)}
                    className={`flex items-center gap-4 p-4 border rounded-lg hover:border-neutral-400 transition-colors `}
                  >
                    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getIssueLabel(key)}</p>
                      <p className="text-sm text-neutral-500">{getIssueDesc(key)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              {/* Selected Issue */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">Issue Type:</p>
                <p className="font-medium">{issueType && getIssueLabel(issueType)}</p>
              </div>

              {/* Description */}
              <div>
                <Label>{t.describeIssue} *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descriptionPlaceholder}
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <Label>{t.uploadEvidence}</Label>
                <p className="text-sm text-neutral-500 mb-2">{t.uploadDesc}</p>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="evidence-upload"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="evidence-upload" className="cursor-pointer">
                    {files.length > 0 ? (
                      <div className="text-emerald-600">
                        <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                        <p>{files.length} file(s) selected</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                        <p className="text-sm text-neutral-500">{t.selectFiles}</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className={`flex gap-3 pt-4`}>
                <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t.submitting}
                    </>
                  ) : (
                    t.submit
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t.submitted}</h3>
              <p className="text-neutral-500 mb-6">{t.submittedDesc}</p>
              <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700">
                {t.done}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportIssueModal;
