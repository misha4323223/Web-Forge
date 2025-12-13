import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "Sweet Delights",
    description: "Интернет-магазин сладостей с админкой, Telegram-приложением, оплатой Robokassa и хранением в Яндекс Cloud.",
    tags: ["React", "Node.js", "PostgreSQL", "Robokassa", "Telegram"],
    color: "from-pink-500 to-orange-400",
    url: "https://sweetdelights.store/",
  },
  {
    id: 2,
    title: "Obzor71",
    description: "Сайт домофонной службы с формой заявок, отзывами и уведомлениями в Telegram.",
    tags: ["React", "TypeScript", "Tailwind", "Telegram Bot"],
    color: "from-blue-500 to-cyan-500",
    url: "https://www.obzor71.ru/",
  },
];

export function PortfolioSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleProjectClick = (url: string | null) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section id="portfolio" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.05),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono mb-6">
            Портфолио
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Наши{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              реализованные проекты
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Каждый проект — это уникальная история успеха наших клиентов. Мы гордимся результатами нашей работы.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.15 }}
            >
              <Card
                className={`group relative overflow-visible p-0 border-border bg-card/50 backdrop-blur-sm hover-elevate ${project.url ? "cursor-pointer" : "cursor-default"}`}
                onClick={() => handleProjectClick(project.url)}
                data-testid={`card-project-${project.id}`}
              >
                <div className={`h-48 md:h-56 rounded-t-md bg-gradient-to-br ${project.color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                  <div className="absolute inset-0 rounded-t-md bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
                  {project.url && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        Live
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    {project.url && (
                      <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="font-mono text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className={`absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                  <div className={`absolute inset-0 rounded-md bg-gradient-to-br ${project.color} opacity-[0.08]`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
