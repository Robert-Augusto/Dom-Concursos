'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    id: '1',
    question: 'Como funciona o plano Premium?',
    answer:
      'O plano Premium dá acesso completo a todos os cursos exclusivos, apostilas, simulados ilimitados e suporte prioritário. O acesso é liberado imediatamente após a confirmação do pagamento.',
  },
  {
    id: '2',
    question: 'Como uso o Estudo Inteligente?',
    answer:
      'Acesse a seção "Estudo Inteligente" no menu principal. Selecione a matéria e o nível de explicação desejado. A plataforma vai apresentar textos teóricos e questões personalizadas para você.',
  },
  {
    id: '3',
    question: 'Como criar um simulado de prova?',
    answer:
      'Vá até a seção "Simulado" e clique em "Novo Simulado". Escolha a banca, dificuldade, matérias com pesos e quantidade de questões. Em seguida clique em iniciar.',
  },
  {
    id: '4',
    question: 'Fui aprovado(a) — como recebo o presente?',
    answer:
      'Parabéns! Entre em contato com nosso suporte pelo WhatsApp informando seu nome e o concurso que passou. Nossa equipe vai verificar e enviar seu presente em até 48 horas úteis.',
  },
  {
    id: '5',
    question: 'Posso assistir aulas offline?',
    answer:
      'No momento as aulas são transmitidas online. Recomendamos assistir em uma rede Wi-Fi estável para a melhor experiência. Em breve teremos a opção de download para assistir offline.',
  },
  {
    id: '6',
    question: 'Como cancelar minha assinatura?',
    answer:
      'Para cancelar, entre em contato pelo WhatsApp ou envie um e-mail para domconcursoss@gmail.com. O cancelamento é processado em até 24 horas e você mantém o acesso até o fim do período pago.',
  },
  {
    id: '7',
    question: 'Esqueci minha senha. E agora?',
    answer:
      'Na tela de login, clique em "Esqueci minha senha". Digite seu e-mail cadastrado e enviaremos um link para redefinir a senha. Verifique também a caixa de spam.',
  },
]

export function FaqAccordion() {
  const [openItemId, setOpenItemId] = useState<string | null>(faqs[0]?.id ?? null)

  const handleToggle = (itemId: string) => {
    setOpenItemId((current) => (current === itemId ? null : itemId))
  }

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
        PERGUNTAS FREQUENTES
      </p>

      <div className="flex flex-col gap-2">
        {faqs.map((item) => {
          const isOpen = openItemId === item.id

          return (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground text-left">{item.question}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
