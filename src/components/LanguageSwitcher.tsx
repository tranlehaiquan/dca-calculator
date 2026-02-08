import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { LANGUAGES } from "../i18n";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-muted-foreground" />
      <Select
        value={i18n.language?.split("-")[0]}
        onValueChange={changeLanguage}
      >
        <SelectTrigger className="h-8 w-[140px] border-white/10 bg-white/5 text-xs">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] border-white/10 bg-slate-900">
          {Object.entries(LANGUAGES).map(([code, label]) => (
            <SelectItem key={code} value={code}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
