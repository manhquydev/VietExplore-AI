"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTeamMembers } from "@/hooks/use-team-members";
import { DEPARTMENT_CONFIG } from "@/lib/types/team";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TeamSection() {
  const { members, loading, error } = useTeamMembers({
    status: 'active',
    featured: true, // Only show featured members on About page
    orderBy: 'displayOrder',
    orderDirection: 'asc'
  });

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

  // Separate members by department for visual hierarchy
  const leadershipMembers = members.filter(m => m.department === 'leadership');
  const otherMembers = members.filter(m => m.department !== 'leadership');

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
    <section className="container py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span className="gradient-text">Đội ngũ</span> <span className="text-foreground">lãnh đạo</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Những người tiên phong với đam mê xây dựng cửa sổ kỹ thuật số mở ra vẻ đẹp Việt Nam
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
        </div>

        {/* Leadership Section - Prominent Display */}
        {leadershipMembers.length > 0 && (
          <div className="mb-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {leadershipMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/team/${member.slug}`}
                  className="group"
                >
                  <div className="glass-card p-8 text-center h-full motion-gentle hover:scale-105 border-2 border-primary/20">
                    {/* Avatar with glass effect - Larger for leadership */}
                    <div className={`relative ${getAvatarSize(member.department)} mx-auto mb-6`}>
                      <Avatar className="w-full h-full shadow-lg ring-2 ring-primary/20">
                        <AvatarImage src={member.avatar} alt={member.fullName} />
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
                    <h3 className="text-xl font-bold text-foreground mb-2">{member.fullName}</h3>
                    <p className="text-primary text-base font-semibold mb-3">{member.title}</p>

                    {/* Department badge */}
                    {member.department && (
                      <Badge variant="default" className="mb-4 bg-primary text-white">
                        {DEPARTMENT_CONFIG[member.department].icon}{' '}
                        {DEPARTMENT_CONFIG[member.department].label}
                      </Badge>
                    )}

                    <p className="text-muted text-sm leading-relaxed mb-4">{member.bio}</p>

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
                  </div>
                </Link>
              ))}
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {otherMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/team/${member.slug}`}
                  className="group"
                >
                  <div className="glass-card p-6 text-center h-full motion-gentle hover:scale-105">
                    {/* Avatar with glass effect */}
                    <div className={`relative ${getAvatarSize(member.department)} mx-auto mb-6`}>
                      <Avatar className="w-full h-full shadow-soft">
                        <AvatarImage src={member.avatar} alt={member.fullName} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary-600 text-white">
                          {member.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full ring-4 ring-white/20 group-hover:ring-primary/30 transition-all duration-300"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>

                    {/* Typography hierarchy */}
                    <h3 className="text-lg font-bold text-foreground mb-2">{member.fullName}</h3>
                    <p className="text-primary text-sm font-medium mb-2">{member.title}</p>

                    {/* Department badge */}
                    {member.department && (
                      <Badge variant="outline" className="mb-4">
                        {DEPARTMENT_CONFIG[member.department].icon}{' '}
                        {DEPARTMENT_CONFIG[member.department].label}
                      </Badge>
                    )}

                    <p className="text-muted text-sm leading-relaxed mb-4">{member.bio}</p>

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
                  </div>
                </Link>
              ))}
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
