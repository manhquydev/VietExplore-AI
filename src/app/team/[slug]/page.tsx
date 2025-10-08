import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Linkedin, Github, Twitter, Facebook, Mail, ExternalLink, Award, GraduationCap, Calendar, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { TeamMember, DEPARTMENT_CONFIG } from '@/lib/types/team';
import { cn } from '@/lib/utils';

interface TeamMemberPageProps {
  params: {
    slug: string;
  };
}

async function getTeamMember(slug: string): Promise<TeamMember | null> {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb
      .collection('team_members')
      .where('slug', '==', slug)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as TeamMember;
  } catch (error) {
    console.error('[TEAM-PROFILE] Error fetching member:', error);
    return null;
  }
}

export async function generateMetadata({ params }: TeamMemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMember(slug);

  if (!member) {
    return {
      title: 'Thành viên không tồn tại - Du Lịch Việt',
      description: 'Không tìm thấy thông tin thành viên này.'
    };
  }

  return {
    title: `${member.fullName} - ${member.title} | Du Lịch Việt`,
    description: member.metaDescription || member.bio,
    openGraph: {
      title: `${member.fullName} - ${member.title}`,
      description: member.bio,
      images: member.avatar ? [{ url: member.avatar }] : [],
      type: 'profile'
    },
    twitter: {
      card: 'summary',
      title: `${member.fullName} - ${member.title}`,
      description: member.bio,
      images: member.avatar ? [member.avatar] : []
    }
  };
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { slug } = await params;
  const member = await getTeamMember(slug);

  if (!member) {
    notFound();
  }

  const departmentConfig = member.department
    ? DEPARTMENT_CONFIG[member.department]
    : null;
  const DepartmentIcon = departmentConfig?.icon;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section with Cover Image */}
        <div className="relative h-64 overflow-hidden">
          {member.coverImage ? (
            <>
              <img
                src={member.coverImage}
                alt={`${member.fullName} cover`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20" />
          )}
        </div>

        <div className="container relative -mt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/about">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Link>
            </Button>

            {/* Profile Card */}
            <Card className="glass-card border-2">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 shadow-xl ring-4 ring-primary/20">
                      <AvatarImage src={member.avatar} alt={member.fullName} />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-primary-600 text-white">
                        {member.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {member.department === 'leadership' && (
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">★</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {member.fullName}
                    </h1>
                    <p className="text-xl text-primary font-semibold mb-4">{member.title}</p>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      {departmentConfig && DepartmentIcon && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "inline-flex items-center rounded-full px-3 h-7 text-sm font-medium transition-colors gap-2",
                            member.department === 'leadership'
                              ? departmentConfig.badge.solid
                              : departmentConfig.badge.subtle
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-sm",
                              departmentConfig.color,
                              member.department === 'leadership' && "shadow-[0_0_0_1px_rgba(255,255,255,0.35)]"
                            )}
                            aria-hidden="true"
                          >
                            <DepartmentIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </span>
                          <span className="font-medium leading-none">{departmentConfig.label}</span>
                        </Badge>
                      )}
                      {member.joinedDate && (
                        <Badge variant="secondary" className="text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Tham gia {new Date(member.joinedDate).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                        </Badge>
                      )}
                    </div>

                    {/* Social Links */}
                    {member.socialLinks && (
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {member.socialLinks.linkedin && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4 mr-1" />
                              LinkedIn
                            </a>
                          </Button>
                        )}
                        {member.socialLinks.github && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 mr-1" />
                              GitHub
                            </a>
                          </Button>
                        )}
                        {member.socialLinks.twitter && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-4 w-4 mr-1" />
                              Twitter
                            </a>
                          </Button>
                        )}
                        {member.socialLinks.facebook && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={member.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                              <Facebook className="h-4 w-4 mr-1" />
                              Facebook
                            </a>
                          </Button>
                        )}
                        {member.socialLinks.email && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${member.socialLinks.email}`}>
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </a>
                          </Button>
                        )}
                        {member.socialLinks.website && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={member.socialLinks.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Website
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-8 pt-8 border-t">
                  <h2 className="text-xl font-bold text-foreground mb-4">Giới thiệu</h2>
                  <p className="text-muted leading-relaxed whitespace-pre-wrap">
                    {member.longBio || member.bio}
                  </p>
                </div>

                {/* Expertise */}
                {member.expertise && member.expertise.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Chuyên môn
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {member.achievements && member.achievements.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Thành tựu
                    </h2>
                    <ul className="space-y-3">
                      {member.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-primary font-bold">•</span>
                          <span className="text-muted leading-relaxed flex-1">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Education */}
                {member.education && member.education.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Học vấn
                    </h2>
                    <div className="space-y-4">
                      {member.education.map((edu, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                            <p className="text-sm text-primary">{edu.institution}</p>
                            {edu.major && (
                              <p className="text-sm text-muted">Chuyên ngành: {edu.major}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {member.tags && member.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <div className="flex flex-wrap gap-2">
                      {member.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Back to Team Button */}
            <div className="mt-8 text-center">
              <Button variant="default" size="lg" asChild>
                <Link href="/about#team">
                  Xem toàn bộ đội ngũ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
