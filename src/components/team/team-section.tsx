"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTeamMembers } from "@/hooks/use-team-members";
import { DEPARTMENT_CONFIG, TeamMemberDepartment } from "@/lib/types/team";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DepartmentBadgeTone = "subtle" | "solid";

function DepartmentBadge({
  department,
  tone = "subtle",
  className
}: {
  department: TeamMemberDepartment;
  tone?: DepartmentBadgeTone;
  className?: string;
}) {
  const config = DEPARTMENT_CONFIG[department];
  const Icon = config.icon;
  const toneClasses = config.badge?.[tone] ?? "";

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center rounded-full px-3 h-7 text-sm font-medium transition-colors gap-2",
        toneClasses,
        className
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-sm",
          config.color,
          tone === "solid" ? "shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" : ""
        )}
        aria-hidden="true"
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </span>
      <span className="font-medium leading-none">{config.label}</span>
    </Badge>
  );
}

export function TeamSection() {
  const organizationName = "VietExplore AI";
  const organizationUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://vietexplore.ai";
  const sanitizedOrganizationUrl = React.useMemo(
    () => organizationUrl.replace(/\/$/, ""),
    [organizationUrl]
  );
  const { members, loading, error } = useTeamMembers({
    status: 'active',
    featured: true, // Only show featured members on About page
    orderBy: 'displayOrder',
    orderDirection: 'asc'
  });
  const leadershipMembers = React.useMemo(
    () => members.filter((m) => m.department === "leadership"),
    [members]
  );
  const otherMembers = React.useMemo(
    () => members.filter((m) => m.department !== "leadership"),
    [members]
  );

  const structuredData = React.useMemo(() => {
    if (leadershipMembers.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": organizationName,
      "url": sanitizedOrganizationUrl,
      "employee": leadershipMembers.map(member => ({
        "@type": "Person",
        "name": member.fullName,
        "jobTitle": member.title,
        "url": `${sanitizedOrganizationUrl}/team/${member.slug}`,
        ...(member.avatar ? { "image": member.avatar } : {}),
        "description": member.bio
      }))
    };
  }, [leadershipMembers, organizationName, sanitizedOrganizationUrl]);
  if (loading) {
    return (
      <section className="container py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="gradient-text">Đội ngũ</span> <span className="text-foreground">sáng lập</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Những người tiên phong với đam mê xây dựng cửa sổ kỹ thuật số mở ra vẻ đẹp Việt Nam
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
          </div>

          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="container py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="gradient-text">Đội ngũ</span> <span className="text-foreground">sáng lập</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Những người tiên phong với đam mê xây dựng cửa sổ kỹ thuật số mở ra vẻ đẹp Việt Nam
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            Không thể tải thông tin đội ngũ. Vui lòng thử lại sau.
          </div>
        </div>
      </section>
    );
  }


  if (members.length === 0) {
    return null; // Don't show section if no team members
  }

  // Helper function to get card size class based on department
  const getCardSizeClass = (department: string | undefined) => {
    if (department === 'leadership') {
      return 'lg:col-span-1'; // Leadership takes full width or larger
    }
    return '';
  };

  // Helper function to get avatar size based on department
  const getAvatarSize = (department: string | undefined) => {
    if (department === 'leadership') {
      return 'w-32 h-32'; // Larger for leadership
    }
    return 'w-24 h-24';
  };

  return (
    <section
      className="container py-20"
      aria-labelledby="leadership-heading"
      itemScope
      itemType="https://schema.org/Organization"
    >
      <meta itemProp="name" content={organizationName} />
      <meta itemProp="url" content={organizationUrl} />
      {structuredData && (
        <Script id="leadership-schema" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-6">
          <h2 id="leadership-heading" className="text-3xl sm:text-4xl font-bold">
            <span className="gradient-text">Đội ngũ</span> <span className="text-foreground">lãnh đạo</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Những người tiên phong với đam mê xây dựng cửa sổ kỹ thuật số mở ra vẻ đẹp Việt Nam
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>

        {/* Leadership Section - Prominent Display */}
        {leadershipMembers.length > 0 && (
          <div className="mb-16" aria-label="Đội ngũ lãnh đạo">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto" role="list">
              {leadershipMembers.map((member) => {
                const profileUrl = `/team/${member.slug}`;

                return (
                  <Link
                    key={member.id}
                    href={profileUrl}
                    className="group"
                    role="listitem"
                    aria-label={`Hồ sơ ${member.fullName}`}
                  >
                    <article
                      className="glass-card p-8 text-center h-full motion-gentle hover:scale-105 border-2 border-primary/20"
                      itemScope
                      itemType="https://schema.org/Person"
                      itemProp="employee"
                    >
                      <meta itemProp="name" content={member.fullName} />
                      <meta itemProp="jobTitle" content={member.title} />
                      <meta itemProp="description" content={member.bio} />
                      <meta itemProp="url" content={`${sanitizedOrganizationUrl}${profileUrl}`} />
                      {member.avatar && <meta itemProp="image" content={member.avatar} />}

                      {/* Avatar with glass effect - Larger for leadership */}
                      <div className={`relative ${getAvatarSize(member.department)} mx-auto mb-6`}>
                        <Avatar className="w-full h-full shadow-lg ring-2 ring-primary/20">
                          <AvatarImage src={member.avatar} alt={member.fullName} itemProp="image" />
                          <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary-600 text-white">
                            {member.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full ring-4 ring-white/20 group-hover:ring-primary/40 transition-all duration-300"></div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                          <span className="text-white text-xs font-bold">★</span>
                        </div>
                      </div>

                      {/* Typography hierarchy */}
                      <h3 className="text-xl font-bold text-foreground mb-2" itemProp="name">
                        {member.fullName}
                      </h3>
                      <p className="text-primary text-base font-semibold mb-3" itemProp="jobTitle">
                        {member.title}
                      </p>

                      {/* Department badge */}
                      {member.department && (
                        <DepartmentBadge
                          department={member.department}
                          tone="solid"
                          className="mb-4 shadow-sm shadow-primary/20"
                        />
                      )}

                      <p className="text-muted text-sm leading-relaxed mb-4" itemProp="description">
                        {member.bio}
                      </p>

                      {/* Expertise tags */}
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-4">
                          {member.expertise.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* View profile hint */}
                      <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-primary flex items-center justify-center gap-1 font-medium">
                          Xem chi tiết <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Team Members - Standard Display */}
        {otherMembers.length > 0 && (
          <div>
            {leadershipMembers.length > 0 && (
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Đội ngũ cốt cán</h3>
                <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" role="list">
              {otherMembers.map((member) => {
                const profileUrl = `/team/${member.slug}`;

                return (
                  <Link
                    key={member.id}
                    href={profileUrl}
                    className="group"
                    role="listitem"
                    aria-label={`Hồ sơ ${member.fullName}`}
                  >
                    <article
                      className="glass-card p-6 text-center h-full motion-gentle hover:scale-105"
                      itemScope
                      itemType="https://schema.org/Person"
                      itemProp="member"
                    >
                      <meta itemProp="name" content={member.fullName} />
                      <meta itemProp="jobTitle" content={member.title} />
                      <meta itemProp="description" content={member.bio} />
                      <meta itemProp="url" content={`${sanitizedOrganizationUrl}${profileUrl}`} />
                      {member.avatar && <meta itemProp="image" content={member.avatar} />}

                      {/* Avatar with glass effect */}
                      <div className={`relative ${getAvatarSize(member.department)} mx-auto mb-6`}>
                        <Avatar className="w-full h-full shadow-soft">
                          <AvatarImage src={member.avatar} alt={member.fullName} itemProp="image" />
                          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary-600 text-white">
                            {member.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full ring-4 ring-white/20 group-hover:ring-primary/30 transition-all duration-300"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                      </div>

                      {/* Typography hierarchy */}
                      <h3 className="text-lg font-bold text-foreground mb-2" itemProp="name">
                        {member.fullName}
                      </h3>
                      <p className="text-primary text-sm font-medium mb-2" itemProp="jobTitle">
                        {member.title}
                      </p>

                      {/* Department badge */}
                      {member.department && (
                        <DepartmentBadge
                          department={member.department}
                          className="mb-4"
                        />
                      )}

                      <p className="text-muted text-sm leading-relaxed mb-4" itemProp="description">
                        {member.bio}
                      </p>

                      {/* Expertise tags */}
                      {member.expertise && member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-4">
                          {member.expertise.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* View profile hint */}
                      <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-primary flex items-center justify-center gap-1">
                          Xem profile <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* View all team button */}
        {members.length >= 3 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild className="motion-gentle hover:scale-105">
              <Link href="/team">
                Xem toàn bộ đội ngũ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
