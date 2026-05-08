'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Gift,
  Mail,
  Medal,
  Send,
  Sparkles,
  Trophy,
  UserRound,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type ApprovalStatus =
  | 'Aprovado(a) dentro das vagas'
  | 'Classificado(a) / Cadastro reserva'
  | 'Estou aguardando convocação'
  | 'Já tomei posse e estou trabalhando';

type StudyTime = 'Menos de 1 mês' | 'De 1 a 3 meses' | 'De 3 a 6 meses' | 'Mais de 6 meses';

type Authorization =
  | 'Sim, autorizo o Dom Concursos a utilizar meu vídeo, imagem e depoimento nas redes sociais e materiais de divulgação'
  | 'Não autorizo';

type FormData = {
  fullName: string;
  email: string;
  instagram: string;
  street: string;
  addressNumber: string;
  district: string;
  city: string;
  cep: string;
  complement: string;
  approvedExam: string;
  roleName: string;
  approvalStatus: ApprovalStatus | '';
  score: string;
  studyTime: StudyTime | '';
  bestSupport: string;
  emotionMoment: string;
  motivationMessage: string;
  authorization: Authorization | '';
};

const initialFormData: FormData = {
  fullName: '',
  email: '',
  instagram: '',
  street: '',
  addressNumber: '',
  district: '',
  city: '',
  cep: '',
  complement: '',
  approvedExam: '',
  roleName: '',
  approvalStatus: '',
  score: '',
  studyTime: '',
  bestSupport: '',
  emotionMoment: '',
  motivationMessage: '',
  authorization: '',
};

const approvalOptions: { value: ApprovalStatus; label: string }[] = [
  { value: 'Aprovado(a) dentro das vagas', label: 'Aprovado(a) dentro das vagas' },
  { value: 'Classificado(a) / Cadastro reserva', label: 'Classificado(a) / Cadastro reserva' },
  { value: 'Estou aguardando convocação', label: 'Estou aguardando convocação' },
  {
    value: 'Já tomei posse e estou trabalhando',
    label: 'Já tomei posse e estou trabalhando',
  },
];

const studyTimeOptions: { value: StudyTime; label: string }[] = [
  { value: 'Menos de 1 mês', label: 'Menos de 1 mês' },
  { value: 'De 1 a 3 meses', label: 'De 1 a 3 meses' },
  { value: 'De 3 a 6 meses', label: 'De 3 a 6 meses' },
  { value: 'Mais de 6 meses', label: 'Mais de 6 meses' },
];

const authorizationOptions: { value: Authorization; label: string }[] = [
  {
    value:
      'Sim, autorizo o Dom Concursos a utilizar meu vídeo, imagem e depoimento nas redes sociais e materiais de divulgação',
    label:
      'Sim, autorizo o Dom Concursos a utilizar meu vídeo, imagem e depoimento nas redes sociais e materiais de divulgação',
  },
  { value: 'Não autorizo', label: 'Não autorizo' },
];

const requiredErrorMessage = 'Este campo é obrigatório.';
const maxUploadSizeInMb = 50;
const maxUploadSizeInBytes = maxUploadSizeInMb * 1024 * 1024;

export default function ApprovedStudentsFormPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputBaseClass =
    'w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40';
  const textAreaBaseClass = `${inputBaseClass} min-h-32 resize-y`;

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const handleTextChange =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: nextValue }));

      if (errors[field]) {
        setErrors((prev) => {
          const nextErrors = { ...prev };
          delete nextErrors[field];
          return nextErrors;
        });
      }
    };

  const handleFileChange =
    (field: 'videoFile' | 'photoFile') => (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0] ?? null;
      const fieldLabel = field === 'videoFile' ? 'vídeo' : 'foto';

      if (selectedFile && selectedFile.size > maxUploadSizeInBytes) {
        if (field === 'videoFile') {
          setVideoFile(null);
        } else {
          setPhotoFile(null);
        }

        setErrors((prev) => ({
          ...prev,
          [field]: `O arquivo de ${fieldLabel} deve ter no máximo ${maxUploadSizeInMb}MB.`,
        }));

        event.target.value = '';
        return;
      }

      if (field === 'videoFile') {
        setVideoFile(selectedFile);
      } else {
        setPhotoFile(selectedFile);
      }

      if (errors[field]) {
        setErrors((prev) => {
          const nextErrors = { ...prev };
          delete nextErrors[field];
          return nextErrors;
        });
      }
    };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) nextErrors.fullName = requiredErrorMessage;
    if (!formData.email.trim()) {
      nextErrors.email = requiredErrorMessage;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Informe um e-mail válido.';
    }
    if (!formData.street.trim()) nextErrors.street = requiredErrorMessage;
    if (!formData.addressNumber.trim()) nextErrors.addressNumber = requiredErrorMessage;
    if (!formData.district.trim()) nextErrors.district = requiredErrorMessage;
    if (!formData.city.trim()) nextErrors.city = requiredErrorMessage;
    if (!formData.cep.trim()) nextErrors.cep = requiredErrorMessage;
    if (!formData.approvedExam.trim()) nextErrors.approvedExam = requiredErrorMessage;
    if (!formData.roleName.trim()) nextErrors.roleName = requiredErrorMessage;
    if (!formData.approvalStatus) nextErrors.approvalStatus = requiredErrorMessage;
    if (!formData.studyTime) nextErrors.studyTime = requiredErrorMessage;
    if (!formData.bestSupport.trim()) nextErrors.bestSupport = requiredErrorMessage;
    if (!formData.emotionMoment.trim()) nextErrors.emotionMoment = requiredErrorMessage;
    if (!formData.motivationMessage.trim()) {
      nextErrors.motivationMessage = requiredErrorMessage;
    }
    if (!videoFile) nextErrors.videoFile = 'Envie o vídeo para continuar.';
    if (!photoFile) nextErrors.photoFile = 'Envie a foto para continuar.';
    if (videoFile && videoFile.size > maxUploadSizeInBytes) {
      nextErrors.videoFile = `O arquivo de vídeo deve ter no máximo ${maxUploadSizeInMb}MB.`;
    }
    if (photoFile && photoFile.size > maxUploadSizeInBytes) {
      nextErrors.photoFile = `O arquivo de foto deve ter no máximo ${maxUploadSizeInMb}MB.`;
    }
    if (!formData.authorization) {
      nextErrors.authorization = 'A autorização é obrigatória para finalizar.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const supabase = createClient()
    event.preventDefault();

    if (!validateForm() || !videoFile || !photoFile) return;

    setIsSubmitting(true);

    //save the image + video in storage
    const [videoUpload, imageUpload] = await Promise.all([
        supabase.storage.from('approved_form').upload(`videos/${Date.now()}-${videoFile.name}`, videoFile),
        supabase.storage.from('approved_form').upload(`photos/${Date.now()}-${photoFile.name}`, photoFile)
    ])

    if (videoUpload.error) {
        toast.error(videoUpload.error.message)
        setIsSubmitting(false);
        return
    }

    if (imageUpload.error) {
        toast.error(imageUpload.error.message)
        setIsSubmitting(false);
        return
    }

    const completeAddress = [
      `Rua: ${formData.street.trim()}`,
      `Nº: ${formData.addressNumber.trim()}`,
      `Bairro: ${formData.district.trim()}`,
      `Cidade: ${formData.city.trim()}`,
      `CEP: ${formData.cep.trim()}`,
      formData.complement.trim() ? `Complemento: ${formData.complement.trim()}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    const {error: formError} = await supabase
        .from('approved_form')
        .insert({
            fullName: formData.fullName,
            email: formData.email,
            instagram: formData.instagram,
            fullAddress: completeAddress,
            approvedExam: formData.approvedExam,
            roleName: formData.roleName,
            approvalStatus: formData.approvalStatus,
            score: formData.score,
            bestSupport: formData.bestSupport,
            emotionMoment: formData.emotionMoment,
            motivationMessage: formData.motivationMessage,
            video_url: videoUpload.data.path,
            imagem_url: imageUpload.data.path,
            authorization:  formData.authorization,
        })
    
    if(formError){
        toast.error(formError.message)
        setIsSubmitting(false);
        return
    }
    
    toast.success("Dados enviados com sucesso !!!")
    setIsSubmitted(true)
  };

  const renderFieldError = (field: string) =>
    errors[field] ? (
      <p className="mt-2 text-xs font-medium text-destructive">{errors[field]}</p>
    ) : null;

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
        <section className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
            Formulário enviado com sucesso!
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Parabéns pela sua conquista. O time do Dom Concursos recebeu seu depoimento e
            em breve entrará em contato sobre o seu presente especial.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="absolute right-4 top-4 flex items-center gap-2 text-primary/80">
            <Sparkles className="h-5 w-5" />
            <Medal className="h-5 w-5" />
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Trophy className="h-4 w-4" />
            Aprovação confirmada
          </div>
          <h1 className="text-3xl font-black leading-tight text-primary sm:text-4xl">
            Formulário Oficial dos Aprovados
          </h1>
          <p className="mt-3 text-base font-semibold text-foreground sm:text-lg">
            Parabéns por essa conquista extraordinária. Você fez história!
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Essa etapa é muito especial para nós. Quero te ouvir de perto, entender sua
            caminhada e registrar esse momento inesquecível. Preencha com carinho:
            cada resposta ajuda a inspirar outros alunos que ainda estão lutando pelo
            mesmo sonho.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-8"
        >
          <section className="space-y-4">
            <p className="text-lg font-semibold uppercase tracking-wider text-accent">
              Seus dados
            </p>

            <div>
              <label htmlFor="fullName" className="mb-2 block text-base font-medium">
                1. Nome completo *
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleTextChange('fullName')}
                placeholder="Digite seu nome completo"
                className={inputBaseClass}
              />
              {renderFieldError('fullName')}
            </div>

            <div>
              <label htmlFor="email" className="mb-2 flex items-center gap-2 text-base font-medium">
                2. E-mail *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleTextChange('email')}
                placeholder="voce@email.com"
                className={inputBaseClass}
              />
              {renderFieldError('email')}
            </div>

            <div>
              <label htmlFor="instagram" className="mb-2 block text-base font-medium">
                3. Instagram
              </label>
              <input
                id="instagram"
                type="text"
                value={formData.instagram}
                onChange={handleTextChange('instagram')}
                placeholder="@seuinstagram"
                className={inputBaseClass}
              />
            </div>

            <div>
              <label className="mb-3 block text-base font-medium">
                4. Endereço completo para envio do presente *
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <input
                    id="street"
                    type="text"
                    value={formData.street}
                    onChange={handleTextChange('street')}
                    placeholder="Rua"
                    className={inputBaseClass}
                  />
                  {renderFieldError('street')}
                </div>

                <div>
                  <input
                    id="addressNumber"
                    type="text"
                    value={formData.addressNumber}
                    onChange={handleTextChange('addressNumber')}
                    placeholder="Número"
                    className={inputBaseClass}
                  />
                  {renderFieldError('addressNumber')}
                </div>

                <div>
                  <input
                    id="district"
                    type="text"
                    value={formData.district}
                    onChange={handleTextChange('district')}
                    placeholder="Bairro"
                    className={inputBaseClass}
                  />
                  {renderFieldError('district')}
                </div>

                <div>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={handleTextChange('city')}
                    placeholder="Cidade"
                    className={inputBaseClass}
                  />
                  {renderFieldError('city')}
                </div>

                <div>
                  <input
                    id="cep"
                    type="text"
                    value={formData.cep}
                    onChange={handleTextChange('cep')}
                    placeholder="CEP"
                    className={inputBaseClass}
                  />
                  {renderFieldError('cep')}
                </div>

                <div className="sm:col-span-2">
                  <input
                    id="complement"
                    type="text"
                    value={formData.complement}
                    onChange={handleTextChange('complement')}
                    placeholder="Complemento"
                    className={inputBaseClass}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-6">
            <p className="text-lg font-semibold uppercase tracking-wider text-accent">
              Sobre sua aprovação
            </p>

            <div>
              <label htmlFor="approvedExam" className="mb-2 block text-base font-medium">
                5. Em qual concurso você foi aprovado(a)? *
              </label>
              <input
                id="approvedExam"
                type="text"
                value={formData.approvedExam}
                onChange={handleTextChange('approvedExam')}
                placeholder="Ex: PM-SP, INSS, TJ-SP"
                className={inputBaseClass}
              />
              {renderFieldError('approvedExam')}
            </div>

            <div>
              <label htmlFor="roleName" className="mb-2 block text-base font-medium">
                6. Qual foi o cargo? *
              </label>
              <input
                id="roleName"
                type="text"
                value={formData.roleName}
                onChange={handleTextChange('roleName')}
                placeholder="Digite o cargo conquistado"
                className={inputBaseClass}
              />
              {renderFieldError('roleName')}
            </div>

            <fieldset>
              <legend className="mb-2 text-base font-medium">7. Você ficou: *</legend>
              <div className="space-y-2">
                {approvalOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <input
                      type="radio"
                      name="approvalStatus"
                      value={option.value}
                      checked={formData.approvalStatus === option.value}
                      onChange={handleTextChange('approvalStatus')}
                      className="mt-0.5 h-4 w-4 border-border text-primary focus:ring-ring"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
              {renderFieldError('approvalStatus')}
            </fieldset>

            <div>
              <label htmlFor="score" className="mb-2 block text-base font-medium">
                8. Qual foi sua nota ou pontuação?
              </label>
              <input
                id="score"
                type="text"
                value={formData.score}
                onChange={handleTextChange('score')}
                placeholder="Ex: 86/100 ou 92 pontos"
                className={inputBaseClass}
              />
            </div>

            <fieldset>
              <legend className="mb-2 text-base font-medium">
                9. Você estudou com o Dom Concursos por quanto tempo? *
              </legend>
              <div className="space-y-2">
                {studyTimeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <input
                      type="radio"
                      name="studyTime"
                      value={option.value}
                      checked={formData.studyTime === option.value}
                      onChange={handleTextChange('studyTime')}
                      className="mt-0.5 h-4 w-4 border-border text-primary focus:ring-ring"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
              {renderFieldError('studyTime')}
            </fieldset>
          </section>

          <section className="space-y-4 border-t border-border pt-6">
            <p className="text-lg font-semibold uppercase tracking-wider text-accent">
              Seu depoimento
            </p>

            <div>
              <label htmlFor="bestSupport" className="mb-2 block text-base font-medium">
                10. O que mais te ajudou durante os estudos e sua preparação? *
              </label>
              <textarea
                id="bestSupport"
                value={formData.bestSupport}
                onChange={handleTextChange('bestSupport')}
                className={textAreaBaseClass}
                style={{ minHeight: '140px' }}
              />
              {renderFieldError('bestSupport')}
            </div>

            <div>
              <label htmlFor="emotionMoment" className="mb-2 block text-base font-medium">
                11. Como foi o momento em que você viu seu nome na lista? O que você sentiu? *
              </label>
              <textarea
                id="emotionMoment"
                value={formData.emotionMoment}
                onChange={handleTextChange('emotionMoment')}
                className={textAreaBaseClass}
                style={{ minHeight: '140px' }}
              />
              {renderFieldError('emotionMoment')}
            </div>

            <div>
              <label htmlFor="motivationMessage" className="mb-2 block text-base font-medium">
                12. O que você diria para quem está estudando agora e pensa em desistir? *
              </label>
              <textarea
                id="motivationMessage"
                value={formData.motivationMessage}
                onChange={handleTextChange('motivationMessage')}
                className={textAreaBaseClass}
                style={{ minHeight: '140px' }}
              />
              {renderFieldError('motivationMessage')}
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-6">
            <p className="text-lg font-semibold uppercase tracking-wider text-accent">
              Mídia e autorização
            </p>

            <div>
              <label htmlFor="videoFile" className="mb-2 block text-base font-medium">
                13. Upload de vídeo *
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                Instruções: gravar na vertical, boa iluminação, entre 30 segundos e 1 minuto.
              </p>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Tamanho máximo permitido: {maxUploadSizeInMb}MB.
              </p>
              <input
                id="videoFile"
                type="file"
                accept="video/*"
                onChange={handleFileChange('videoFile')}
                className={`${inputBaseClass} file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground`}
              />
              {videoFile ? (
                <p className="mt-2 text-xs text-primary">Arquivo selecionado: {videoFile.name}</p>
              ) : null}
              {renderFieldError('videoFile')}
            </div>

            <div>
              <label htmlFor="photoFile" className="mb-2 block text-base font-medium">
                14. Upload de foto *
              </label>
              <p className="mb-2 text-xs text-muted-foreground">
                De preferência na posse, no trabalho com uniforme, ou foto de perfil.
              </p>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Tamanho máximo permitido: {maxUploadSizeInMb}MB.
              </p>
              <input
                id="photoFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange('photoFile')}
                className={`${inputBaseClass} file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground`}
              />
              {photoFile ? (
                <p className="mt-2 text-xs text-primary">Arquivo selecionado: {photoFile.name}</p>
              ) : null}
              {renderFieldError('photoFile')}
            </div>

            <fieldset className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
              <legend className="px-1 text-sm font-semibold text-destructive">
                Autorização de uso de imagem e depoimento *
              </legend>
              <div className="mb-3 mt-1 flex items-start gap-2 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <p>Campo obrigatório para finalizar o formulário.</p>
              </div>
              <div className="space-y-2">
                {authorizationOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <input
                      type="radio"
                      name="authorization"
                      value={option.value}
                      checked={formData.authorization === option.value}
                      onChange={handleTextChange('authorization')}
                      className="mt-0.5 h-4 w-4 border-border text-primary focus:ring-ring"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
              {renderFieldError('authorization')}
            </fieldset>
          </section>

          <section className="rounded-xl border border-primary/30 bg-primary/10 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-primary/20 p-2 text-primary">
                <Gift className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-foreground sm:text-base">
                Obrigado por fazer parte da nossa história! Sua aprovação também nos inspira.
                Em breve entraremos em contato sobre o seu presente especial.
              </p>
            </div>
          </section>

          {hasErrors ? (
            <p className="text-xs font-medium text-destructive">
              Revise os campos destacados antes de enviar.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-extrabold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <UserRound className="h-4 w-4 animate-pulse" />
                Enviando formulário...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar formulário
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}