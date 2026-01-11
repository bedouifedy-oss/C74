'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocale } from '@/hooks/useLocale';
import { HeaderMenu, getPublicMenuItems } from '@/components/HeaderMenu';

export default function ShadcnShowcasePage() {
  const { locale, setLocale } = useLocale();

  const t = {
    en: { title: 'ShadCN UI Components', subtitle: 'Component library showcase for C74' },
    fr: { title: 'Composants ShadCN UI', subtitle: 'Bibliothèque de composants pour C74' },
    'ar-TN': { title: 'مكونات ShadCN', subtitle: 'مكتبة المكونات لـ C74' },
  }[locale];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <HeaderMenu
        locale={locale}
        onLocaleChange={setLocale}
        menuItems={getPublicMenuItems(locale, 'shadcn')}
        title={t.title}
        subtitle={t.subtitle}
      />
      <div className="max-w-4xl mx-auto space-y-8 p-8">

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Enter your message" />
            </div>
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card>
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
