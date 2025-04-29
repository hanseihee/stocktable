import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
  const { t, i18n } = useTranslation();

  // 디버깅을 위한 콘솔 로그
  console.log('Current language:', i18n.language);
  console.log('Translation test:', t('terms.title'));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('terms.title', 'Terms of Service')}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" paragraph>
            {t('terms.lastUpdated', 'Last updated: April 29, 2025')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.acceptance.title', 'Acceptance of Terms')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.acceptance.content', 'By accessing or using www.tickipop.com, you agree to abide by these Terms of Service.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.description.title', 'Description of Service')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.description.content', 'We provide informational content and resources via our website. All content is offered "as is" and for general information purposes only.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.conduct.title', 'User Conduct')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.conduct.content', 'You agree not to: Engage in any unlawful, fraudulent, or harmful activities. Attempt to gain unauthorized access to our systems. Disrupt or interfere with the functionality of the Service.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.intellectual.title', 'Intellectual Property')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.intellectual.content', 'All content, logos, and materials on this website are the property of www.tickipop.com or its licensors and are protected by copyright and trademark laws.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.warranties.title', 'Disclaimer of Warranties')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.warranties.content', 'The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any content.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.liability.title', 'Limitation of Liability')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.liability.content', 'To the fullest extent permitted by law, www.tickipop.com and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the Service.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.governing.title', 'Governing Law')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.governing.content', 'These Terms are governed by the laws of the Republic of Korea, without regard to its conflict of laws principles.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.changes.title', 'Changes to Terms')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.changes.content', 'We may modify these Terms at any time. When changes are made, we will update the "Last updated" date above.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('terms.contact.title', 'Contact Information')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('terms.contact.content', 'For questions or concerns regarding these Terms, please contact us at: support@tickipop.com')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService; 