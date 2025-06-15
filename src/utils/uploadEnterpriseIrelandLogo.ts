
import { supabase } from "@/integrations/supabase/client";

export const uploadEnterpriseIrelandLogo = async () => {
  // Create a simple SVG logo for Enterprise Ireland
  const logoSvg = `
    <svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="80" fill="#00a651"/>
      <text x="100" y="30" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">
        Enterprise
      </text>
      <text x="100" y="50" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">
        Ireland
      </text>
      <circle cx="30" cy="40" r="15" fill="white"/>
      <text x="30" y="45" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#00a651">
        EI
      </text>
    </svg>
  `;

  // Convert SVG to blob
  const blob = new Blob([logoSvg], { type: 'image/svg+xml' });
  const file = new File([blob], 'enterprise-ireland-logo.svg', { type: 'image/svg+xml' });

  try {
    console.log('Starting Enterprise Ireland logo upload process...');

    // Upload the SVG file (with upsert to overwrite if exists)
    const { data, error } = await supabase.storage
      .from('tradeagencies')
      .upload('enterprise-ireland-logo.svg', file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading Enterprise Ireland logo:', error);
      return false;
    }

    console.log('Enterprise Ireland logo uploaded successfully:', data);

    // Update the database record with the correct SVG URL
    const { error: updateError } = await supabase
      .from('trade_investment_agencies')
      .update({ 
        logo: 'https://xhziwveaiuhzdoutpgrh.supabase.co/storage/v1/object/public/tradeagencies/enterprise-ireland-logo.svg'
      })
      .eq('name', 'Enterprise Ireland');

    if (updateError) {
      console.error('Error updating Enterprise Ireland logo URL:', updateError);
      return false;
    }

    console.log('Enterprise Ireland logo URL updated in database');
    return true;
  } catch (error) {
    console.error('Error uploading Enterprise Ireland logo:', error);
    return false;
  }
};
