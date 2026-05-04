export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">DOM Concursos - Pedro Testando - Vercel</h1>
          <p className="text-muted-foreground">Design System Showcase</p>
        </div>

        {/* COLORS */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Colors</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-background border border-border" />
              <p className="text-xs text-muted-foreground">background</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-card" />
              <p className="text-xs text-muted-foreground">card</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-primary" />
              <p className="text-xs text-muted-foreground">primary (gold)</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-accent" />
              <p className="text-xs text-muted-foreground">accent (blue)</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-muted" />
              <p className="text-xs text-muted-foreground">muted</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-secondary" />
              <p className="text-xs text-muted-foreground">secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-destructive" />
              <p className="text-xs text-muted-foreground">destructive (red)</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-sidebar" />
              <p className="text-xs text-muted-foreground">sidebar</p>
            </div>
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Typography</h2>
          <div className="space-y-3">
            <p className="text-4xl font-bold text-foreground">Heading 1 — Rumo à Aprovação</p>
            <p className="text-2xl font-semibold text-foreground">Heading 2 — Direito Constitucional</p>
            <p className="text-xl font-medium text-foreground">Heading 3 — Questões Comentadas</p>
            <p className="text-base text-foreground">Body — Estude com foco e determinação para conquistar sua vaga no serviço público.</p>
            <p className="text-sm text-muted-foreground">Muted — Última atualização: hoje às 14h32</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Label — BANCA CESPE</p>
          </div>
        </section>

        {/* BUTTONS */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              Começar Agora
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              Estudo Inteligente
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              Ver Apostilas
            </button>
            <button className="px-5 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
              Secundário
            </button>
            <button className="px-5 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              Cancelar
            </button>
          </div>
        </section>

        {/* BADGES */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">Premium</span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">Gratuito</span>
            <span className="px-3 py-1 rounded-full bg-chart-2/20 text-chart-2 text-xs font-medium">Aprovado</span>
            <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium">Expirado</span>
            <span className="px-3 py-1 rounded-full bg-chart-5/20 text-chart-5 text-xs font-medium">CESPE</span>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">FCC</span>
          </div>
        </section>

        {/* COURSE CARDS */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Course Cards</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Direito Constitucional", lessons: 48, tag: "Premium", tagColor: "bg-primary/20 text-primary" },
              { title: "Português para Concursos", lessons: 32, tag: "Gratuito", tagColor: "bg-accent/20 text-accent" },
              { title: "Raciocínio Lógico", lessons: 24, tag: "Premium", tagColor: "bg-primary/20 text-primary" },
            ].map((course) => (
              <div key={course.title} className="bg-card rounded-xl p-5 border border-border hover:border-primary/40 transition-colors space-y-4 cursor-pointer">
                <div className="h-24 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-3xl">📚</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-sm leading-snug">{course.title}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${course.tagColor}`}>{course.tag}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{course.lessons} aulas</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>60%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-3/5 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS CARDS */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Stats Cards</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Questões Respondidas", value: "1.240", color: "text-primary" },
              { label: "Taxa de Acerto", value: "74%", color: "text-chart-2" },
              { label: "Aulas Concluídas", value: "38", color: "text-accent" },
              { label: "Simulados Feitos", value: "12", color: "text-chart-5" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-5 border border-border space-y-2">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* QUESTION CARD */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Question Card (Simulado)</h2>
          <div className="bg-card rounded-xl p-6 border border-border space-y-5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-chart-5/20 text-chart-5 text-xs font-medium">CESPE • Difícil</span>
              <span className="text-xs text-muted-foreground">Questão 3 de 30</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Com relação aos direitos e garantias fundamentais previstos na Constituição Federal de 1988, julgue o item a seguir.
              A casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre.
            </p>
            <div className="space-y-2">
              {["Certo", "Errado"].map((option, i) => (
                <button
                  key={option}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors
                    ${i === 0
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-foreground hover:border-muted-foreground"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* NOTIFICATION CARD */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Notification Card</h2>
          <div className="space-y-2">
            {[
              { title: "Nova aula disponível", desc: "Direito Constitucional — Aula 12: Remédios Constitucionais", time: "agora", unread: true },
              { title: "Simulado concluído", desc: "Você acertou 74% das questões. Parabéns!", time: "2h atrás", unread: false },
            ].map((notif) => (
              <div key={notif.title} className={`flex gap-4 p-4 rounded-xl border transition-colors ${notif.unread ? "bg-card border-primary/30" : "bg-muted/30 border-border"}`}>
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notif.unread ? "bg-primary" : "bg-transparent"}`} />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.desc}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{notif.time}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}