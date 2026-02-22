import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PlannerProgress } from '@/components/planner/PlannerProgress';
import { PlannerStep1Persona } from '@/components/planner/PlannerStep1Persona';
import { PlannerStep2Company } from '@/components/planner/PlannerStep2Company';
import { PlannerStep3Goals } from '@/components/planner/PlannerStep3Goals';
import { PlannerGeneratingOverlay } from '@/components/planner/PlannerGeneratingOverlay';
import { PlanResult } from '@/components/planner/PlanResult';
import { usePersona, type Persona } from '@/contexts/PersonaContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompanyData {
  company_name: string;
  sector: string;
  stage: string;
  origin_country: string;
}

interface PlanResponse {
  plan: string;
  metadata: {
    persona: string;
    sector: string;
    stage: string;
    goals: string[];
    providers_matched: number;
    events_matched: number;
    mentors_matched: number;
  };
}

const Planner = () => {
  const [searchParams] = useSearchParams();
  const { setPersona } = usePersona();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null);
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_name: '',
    sector: '',
    stage: '',
    origin_country: '',
  });
  const [goals, setGoals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planResult, setPlanResult] = useState<PlanResponse | null>(null);

  // Handle persona from URL query parameter
  useEffect(() => {
    const personaParam = searchParams.get('persona');
    if (personaParam === 'international_entrant' || personaParam === 'local_startup') {
      setSelectedPersona(personaParam);
      setPersona(personaParam);
      setStep(2);
    }
  }, [searchParams, setPersona]);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    if (persona) {
      setPersona(persona);
    }
    setStep(2);
  };

  const handleGenerate = async () => {
    if (!selectedPersona || goals.length === 0) return;

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-plan', {
        body: {
          persona: selectedPersona,
          company_name: companyData.company_name,
          sector: companyData.sector,
          stage: companyData.stage,
          origin_country: companyData.origin_country || undefined,
          goals,
        },
      });

      if (error) throw error;

      setPlanResult(data as PlanResponse);
      setStep(4);
    } catch (err) {
      console.error('Plan generation failed:', err);
      toast({
        title: 'Generation failed',
        description: 'Something went wrong generating your plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setSelectedPersona(null);
    setCompanyData({ company_name: '', sector: '', stage: '', origin_country: '' });
    setGoals([]);
    setPlanResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Plan Your Market Entry | Market Entry Secrets</title>
        <meta
          name="description"
          content="Generate a tailored market entry or growth plan for the Australian market. Answer a few questions and get matched with providers, mentors, and resources."
        />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          {step < 4 && (
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {selectedPersona === 'local_startup'
                  ? 'Plan Your Growth Strategy'
                  : 'Plan Your Market Entry'}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Answer a few questions and we'll generate a tailored plan with matched providers, mentors, events, and action steps.
              </p>
            </div>
          )}

          {step === 4 && planResult && (
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Your {selectedPersona === 'local_startup' ? 'Growth' : 'Market Entry'} Plan
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Here's your personalised plan for {companyData.company_name}.
              </p>
            </div>
          )}

          {step < 4 && <PlannerProgress currentStep={step} totalSteps={4} />}

          {step === 1 && <PlannerStep1Persona onSelect={handlePersonaSelect} />}

          {step === 2 && (
            <PlannerStep2Company
              persona={selectedPersona}
              data={companyData}
              onChange={setCompanyData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <PlannerStep3Goals
              persona={selectedPersona}
              goals={goals}
              onChange={setGoals}
              onBack={() => setStep(2)}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          )}

          {step === 4 && planResult && (
            <PlanResult
              plan={planResult.plan}
              metadata={planResult.metadata}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>

      <PlannerGeneratingOverlay isVisible={isGenerating} />
    </>
  );
};

export default Planner;
