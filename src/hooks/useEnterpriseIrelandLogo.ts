
import { useEffect } from 'react';
import { uploadEnterpriseIrelandLogo } from '@/utils/uploadEnterpriseIrelandLogo';

export const useEnterpriseIrelandLogo = () => {
  useEffect(() => {
    const uploadLogo = async () => {
      try {
        await uploadEnterpriseIrelandLogo();
      } catch (error) {
        console.error('Failed to upload Enterprise Ireland logo:', error);
      }
    };

    uploadLogo();
  }, []);
};
