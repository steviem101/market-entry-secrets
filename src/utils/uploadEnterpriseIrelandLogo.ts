
import { supabase } from "@/integrations/supabase/client";

export const uploadEnterpriseIrelandLogo = async () => {
  try {
    console.log('Updating Enterprise Ireland logo URL in database...');

    // Update the database record with the new PNG logo URL
    const { error: updateError } = await supabase
      .from('trade_investment_agencies')
      .update({ 
        logo: 'https://xhziwveaiuhzdoutpgrh.supabase.co/storage/v1/object/public/tradeagencies//EI_Logo_Primary_2_RGB_20230808134309%20(1).png'
      })
      .eq('name', 'Enterprise Ireland');

    if (updateError) {
      console.error('Error updating Enterprise Ireland logo URL:', updateError);
      return false;
    }

    console.log('Enterprise Ireland logo URL updated in database');
    return true;
  } catch (error) {
    console.error('Error updating Enterprise Ireland logo:', error);
    return false;
  }
};
