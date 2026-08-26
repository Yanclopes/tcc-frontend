import { Bot, MessageSquarePlus, Send, Sparkles, Trash2, TriangleAlert } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Mensagem } from '@/components/chat/Mensagem';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FullPageSpinner, Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { chatService } from '@/services/chat.service';
import type { ChatConversa, ChatMensagem, ChatStatus } from '@/types';

/** Perguntas de partida, para quem abre a tela sem saber o que pedir. */
const SUGESTOES = [
  'Que perguntas eu deveria revisar ou desativar agora?',
  'Algum ODS está com cobertura fraca no banco de perguntas?',
  'Em quais escolas a participação ainda não chegou?',
  'Me mostra um gráfico da taxa de acerto por ODS',
];

/**
 * Assistente de análise com RAG (admin). Ver .specs/06-chat-ia.md.
 *
 * Sem streaming na v1: a resposta chega inteira. Em compensação vem com os
 * passos (o que foi recuperado, quais consultas rodaram), que é o que dá
 * transparência ao RAG.
 */
export function ChatPage() {
  const { toast } = useToast();

  const [status, setStatus] = useState<ChatStatus>();
  const [conversas, setConversas] = useState<ChatConversa[]>([]);
  const [atualId, setAtualId] = useState<string>();
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([]);
  const [pergunta, setPergunta] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const fimDaLista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([chatService.status(), chatService.listarConversas()])
      .then(([s, c]) => {
        setStatus(s);
        setConversas(c);
      })
      .catch((e) => toast(extractError(e), 'error'))
      .finally(() => setCarregando(false));
  }, [toast]);

  useEffect(() => {
    fimDaLista.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, enviando]);

  const abrir = async (id: string) => {
    setAtualId(id);
    try {
      const { mensagens: msgs } = await chatService.obterConversa(id);
      setMensagens(msgs);
    } catch (e) {
      toast(extractError(e), 'error');
    }
  };

  const novaConversa = () => {
    setAtualId(undefined);
    setMensagens([]);
    setPergunta('');
  };

  const remover = async (id: string) => {
    try {
      await chatService.removerConversa(id);
      setConversas((atuais) => atuais.filter((c) => c.id !== id));
      if (atualId === id) novaConversa();
    } catch (e) {
      toast(extractError(e), 'error');
    }
  };

  const enviar = async (texto: string) => {
    const conteudo = texto.trim();
    if (!conteudo || enviando) return;

    setEnviando(true);
    setPergunta('');

    // Otimista: a pergunta aparece na hora. A resposta pode levar segundos
    // (embedding + recuperação + uma ou mais chamadas de modelo).
    const provisoria: ChatMensagem = {
      id: -Date.now(),
      papel: 'usuario',
      conteudo,
      criadaEm: new Date().toISOString(),
    };
    setMensagens((atuais) => [...atuais, provisoria]);

    try {
      let conversaId = atualId;
      if (!conversaId) {
        const nova = await chatService.criarConversa();
        conversaId = nova.id;
        setAtualId(nova.id);
        setConversas((atuais) => [nova, ...atuais]);
      }

      const { mensagem } = await chatService.perguntar(conversaId, conteudo);
      setMensagens((atuais) => [...atuais, mensagem]);

      // O título da conversa é derivado da primeira pergunta no back-end.
      setConversas((atuais) =>
        atuais.map((c) =>
          c.id === conversaId && c.titulo === 'Nova conversa'
            ? { ...c, titulo: conteudo.slice(0, 200) }
            : c,
        ),
      );
    } catch (e) {
      // Desfaz a mensagem otimista para não deixar pergunta órfã na tela.
      setMensagens((atuais) => atuais.filter((m) => m.id !== provisoria.id));
      setPergunta(conteudo);
      toast(extractError(e, 'Não foi possível falar com o assistente.'), 'error');
    } finally {
      setEnviando(false);
    }
  };

  const aoSubmeter = (e: FormEvent) => {
    e.preventDefault();
    void enviar(pergunta);
  };

  if (carregando) return <FullPageSpinner label="Carregando o assistente..." />;

  if (status && !status.habilitado) {
    return (
      <Card className="mx-auto mt-10 max-w-2xl border-amber-200 bg-amber-50">
        <CardContent className="flex gap-3">
          <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold">Assistente não configurado</p>
            <p className="mt-1">
              Defina <code className="font-mono">OPENAI_API_KEY</code> no ambiente do back-end e
              rode <code className="font-mono">npm run chat:indexar</code> para montar a base de
              conhecimento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      {/* Lateral de conversas */}
      <aside className="space-y-2">
        <Button onClick={novaConversa} variant="outline" className="w-full justify-start gap-2">
          <MessageSquarePlus className="h-4 w-4" /> Nova conversa
        </Button>

        <div className="space-y-1">
          {conversas.map((c) => (
            <div
              key={c.id}
              className={cn(
                'group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm',
                atualId === c.id ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              <button
                type="button"
                onClick={() => void abrir(c.id)}
                className="min-w-0 flex-1 truncate text-left"
                title={c.titulo}
              >
                {c.titulo}
              </button>
              <button
                type="button"
                onClick={() => void remover(c.id)}
                aria-label={`Apagar conversa ${c.titulo}`}
                className="opacity-0 transition group-hover:opacity-100 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Conversa */}
      <Card className="flex min-h-[70vh] flex-col">
        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {mensagens.length === 0 ? (
            <div className="m-auto max-w-lg text-center">
              <Bot className="mx-auto h-10 w-10 text-brand-600" />
              <h2 className="mt-3 text-lg font-bold text-slate-900">Assistente do administrador</h2>
              <p className="mt-1 text-sm text-slate-500">
                Pergunte o que revisar, onde a participação não chegou ou o que fazer com um
                número. Os dados vêm de consulta ao banco no momento da pergunta.
              </p>
              <div className="mt-5 grid gap-2 text-left">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void enviar(s)}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:border-brand-300 hover:bg-brand-50"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            mensagens.map((m) => <Mensagem key={m.id} mensagem={m} />)
          )}

          {enviando && (
            <div className="flex items-center gap-2 pl-11 text-sm text-slate-500">
              <Spinner className="h-4 w-4" />
              Consultando a base e os dados...
            </div>
          )}
          <div ref={fimDaLista} />
        </CardContent>

        <form onSubmit={aoSubmeter} className="flex gap-2 border-t border-slate-200 p-3">
          <input
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Pergunte sobre o levantamento..."
            aria-label="Pergunta"
            maxLength={2000}
            disabled={enviando}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50"
          />
          <Button type="submit" disabled={enviando || !pergunta.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            Enviar
          </Button>
        </form>
      </Card>

      {status && (
        <p className="text-xs text-slate-400 lg:col-span-2">
          {status.trechosIndexados} trechos indexados · modelo {status.modelo} · as perguntas são
          registradas na trilha de auditoria (LGPD)
        </p>
      )}
    </div>
  );
}
