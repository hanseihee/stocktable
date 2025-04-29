import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
  const { t, i18n } = useTranslation();

  // 디버깅을 위한 콘솔 로그
  console.log('Current language:', i18n.language);
  console.log('Translation test:', t('privacy.title'));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('privacy.title', 'Privacy Policy')}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" paragraph>
            {t('privacy.lastUpdated', 'Last updated: April 29, 2025')}
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('privacy.introduction.title', 'Introduction')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy.introduction.content', 'Welcome to www.tickipop.com. This Privacy Policy explains how we handle information when you visit and use our website.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('privacy.noPersonalInfo.title', 'No Personal Information Collected')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy.noPersonalInfo.content', 'We do not collect, process, store, or share any personal information from visitors.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('privacy.cookies.title', 'Cookies and Analytics')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy.cookies.content', 'We do not use cookies to track or identify individual users. We do not employ third-party analytics or tracking tools that collect personal data.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('privacy.thirdParty.title', 'Third-Party Links')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy.thirdParty.content', 'Our site may contain links to external websites. These sites have their own privacy practices.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('privacy.children.title', "Children's Privacy")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy.children.content', 'Our site is intended for a general audience and does not target children under the age of 13.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('privacy.changes.title', 'Policy Changes')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy.changes.content', 'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top.')}
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            {t('privacy.contact.title', 'Contact Us')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy.contact.content', 'If you have any questions about this Privacy Policy, please contact us at: support@tickipop.com')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy; 