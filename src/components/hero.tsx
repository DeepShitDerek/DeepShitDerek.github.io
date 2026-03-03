import { motion } from "framer-motion";
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  Terminal,
  CircleDashed,
  Layers,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { useGetSiteIdentityQuery } from "@/store/api/publicApi";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const socialIcons: { [key: string]: React.ComponentType<any> } = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

const HeroSkeleton = () => (
  <section className="py-12 lg:py-20 grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
    <div className="lg:col-span-7 space-y-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-24 w-full max-w-2xl" />
      <Skeleton className="h-8 w-full max-w-lg" />
      <Skeleton className="h-32 w-full max-w-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
    <div className="lg:col-span-5">
      <Skeleton className="h-[400px] w-full rounded-xl" />
    </div>
  </section>
);

export default function Hero() {
  const { data: content, isLoading } = useGetSiteIdentityQuery();

  if (isLoading || !content) return <HeroSkeleton />;

  const { profile_data: hero, social_links: socials } = content;
  const { status_panel } = hero;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-16 lg:py-32 relative overflow-hidden">
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Content */}
        <div
          className={cn(
            "flex flex-col gap-6 relative z-10",
            status_panel.show
              ? "lg:col-span-7"
              : "lg:col-span-12 text-center items-center",
          )}
        >
          {/* Decorator */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 text-primary font-mono text-sm tracking-widest uppercase"
          >
            <Terminal className="size-4" />
            <span>System Online</span>
          </motion.div>

          {/* Name Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-black text-foreground tracking-tighter leading-[0.95]"
            style={{ fontSize: "clamp(3.5rem, 10vw, 5rem)" }}
          >
            {hero.name}
            <span className="text-primary font-black">.</span>
          </motion.h1>

          {/* Title */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4"
          >
            <div className="h-px w-12 bg-primary/50" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-mono text-muted-foreground">
              {hero.title}
            </h2>
          </motion.div>

          {/* Description */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "max-w-xl prose prose-lg prose-p:text-muted-foreground prose-a:text-primary prose-p:leading-relaxed",
              !status_panel.show && "mx-auto",
            )}
          >
            <ReactMarkdown>{hero.description}</ReactMarkdown>
          </motion.div>

          {/* Actions & Socials */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "flex flex-wrap gap-4 pt-4",
              !status_panel.show && "justify-center",
            )}
          >
            {socials
              .filter((s) => s.is_visible)
              .map((social, index) => {
                const Icon = socialIcons[social.id.toLowerCase()];
                if (!Icon) return null;
                const isPrimary = index === 0;
                return (
                  <Button
                    key={social.url}
                    asChild
                    variant={isPrimary ? "default" : "outline"}
                    size="lg"
                    className={cn(
                      "gap-2 transition-all duration-300",
                      isPrimary
                        ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        : "border-border bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                    )}
                  >
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="size-4" />
                      {social.label}
                    </a>
                  </Button>
                );
              })}
          </motion.div>
        </div>

        {/* Right Content - The HUD */}
        {status_panel.show && (
          <motion.div className="lg:col-span-5 w-full" variants={itemVariants}>
            <div className="relative group">
              {/* Wiz Glow Effect */}
              <div className="absolute -inset-1 bg-primary rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-500" />

              <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all relative p-6 md:p-8 overflow-hidden border-border/50">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4 text-primary" />
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                      {status_panel.title || "Live Status"}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="size-2 rounded-full bg-red-400/30" />
                    <span className="size-2 rounded-full bg-yellow-400/30" />
                    <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>

                {/* Content Grid */}
                <div className="space-y-6">
                  {/* Availability */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                      <CircleDashed className="size-3" /> Availability
                    </span>
                    <div className="flex items-center gap-3 text-sm font-medium text-green-600">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      {status_panel.availability}
                    </div>
                  </div>

                  {/* Exploring */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                      <Layers className="size-3" />{" "}
                      {status_panel.currently_exploring.title}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {status_panel.currently_exploring.items.map((item) => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 font-mono text-xs"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Latest Project Link */}
                  <div className="pt-4 mt-2 border-t border-border">
                    <Link
                      href={status_panel.latestProject.href}
                      className="flex items-center justify-between group/link p-3 -mx-3 rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">
                          LATEST DEPLOY
                        </p>
                        <p className="font-bold text-foreground">
                          {status_panel.latestProject.name}
                        </p>
                      </div>
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-primary-foreground transition-all shadow-sm">
                        <ArrowRight className="size-4" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
