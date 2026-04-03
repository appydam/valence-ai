import { Mail, Linkedin, Phone, Building2, CheckCircle2 } from "lucide-react";

interface Props {
  name: string;
  title: string;
  company: string;
  email?: string;
  linkedin?: string;
  phone?: string;
  enriched?: boolean;
}

export function ContactCard({ name, title, company, email, linkedin, phone, enriched }: Props) {
  return (
    <div className="px-4 py-3 rounded-xl border border-border/50 bg-card hover:border-border/80 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-foreground/60">
            {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            {enriched && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Building2 className="w-3 h-3 text-muted-foreground/40" />
            <p className="text-[10px] text-muted-foreground/60 truncate">{company}</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline">
                <Mail className="w-3 h-3" />
                {email}
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline">
                <Linkedin className="w-3 h-3" />
                LinkedIn
              </a>
            )}
            {phone && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Phone className="w-3 h-3" />
                {phone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
