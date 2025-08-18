import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserRoleDisplay } from "@/components/ui/role-badge"
import { Icon } from "@/components/ui/icon"
import Link from "next/link"

interface ContributorShowcaseProps {
  contributors: Array<{
    id: string
    name: string
    username: string
    avatar?: string
    role: "contributor" | "partner"
    verified: boolean
    contributions: number
    specialties: string[]
    bio?: string
  }>
  title?: string
  showAll?: boolean
}

export const ContributorShowcase: React.FC<ContributorShowcaseProps> = ({
  contributors,
  title = "Cộng tác viên nổi bật",
  showAll = false
}) => {
  const displayContributors = showAll ? contributors : contributors.slice(0, 6)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="users" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayContributors.map((contributor) => (
            <div key={contributor.id} className="flex flex-col items-center text-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
              <Avatar className="w-16 h-16 mb-3">
                <AvatarImage src={contributor.avatar} alt={contributor.name} />
                <AvatarFallback>
                  {contributor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h4 className="font-semibold text-text mb-1">{contributor.name}</h4>
              <p className="text-sm text-muted mb-2">@{contributor.username}</p>
              
              <div className="mb-3">
                <UserRoleDisplay 
                  role={contributor.role}
                  verified={contributor.verified}
                  variant="compact"
                />
              </div>
              
              {contributor.bio && (
                <p className="text-xs text-muted mb-3 line-clamp-2">
                  {contributor.bio}
                </p>
              )}
              
              <div className="flex flex-wrap gap-1 mb-3">
                {contributor.specialties.slice(0, 2).map((specialty, index) => (
                  <span key={index} className="text-xs bg-surface px-2 py-1 rounded">
                    {specialty}
                  </span>
                ))}
              </div>
              
              <div className="text-xs text-muted mb-3">
                {contributor.contributions} đóng góp
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link href={`/profile/${contributor.username}`}>
                  Xem hồ sơ
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        {!showAll && contributors.length > 6 && (
          <div className="text-center mt-6">
            <Button variant="outline">
              Xem tất cả {contributors.length} cộng tác viên
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized component for partner showcase
export const PartnerShowcase: React.FC<{
  partners: Array<{
    id: string
    name: string
    type: string
    logo?: string
    description: string
    website?: string
    contributions: number
  }>
}> = ({ partners }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RoleBadge role="partner" variant="compact" />
          Đối tác cộng đồng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partners.map((partner) => (
            <div key={partner.id} className="flex gap-4 p-4 rounded-lg border border-border">
              <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center flex-shrink-0">
                {partner.logo ? (
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <Icon name="shield" className="text-primary" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-text">{partner.name}</h4>
                  <RoleBadge role="partner" variant="compact" />
                </div>
                <p className="text-xs text-muted mb-2">{partner.type}</p>
                <p className="text-sm text-muted mb-3 line-clamp-2">
                  {partner.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {partner.contributions} đóng góp
                  </span>
                  {partner.website && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={partner.website} target="_blank">
                        <Icon name="share" className="w-3 h-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

