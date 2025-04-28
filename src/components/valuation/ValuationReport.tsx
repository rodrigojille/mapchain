import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Group, 
  Paper, 
  Text, 
  Loader, 
  Modal, 
  Tabs,
  Badge,
  ActionIcon,
  Tooltip,
  Menu,
  Divider,
  Box
} from '@mantine/core';
import { 
  IconDownload, 
  IconPrinter, 
  IconShare, 
  IconCertificate,
  IconLanguage,
  IconInfoCircle,
  IconCheck
} from '@tabler/icons-react';
import { PDFService, ValuationReportData } from '../../services/PDFService';
import { PropertyData } from '../../services/propertyApi';
import { User } from '../../types/user';
import { useTranslation } from '../../hooks/useTranslation';
import { useHederaContract } from '../../hooks/useHederaContract';

interface ValuationReportProps {
  property: PropertyData;
  valuationAmount: number;
  valuationDate: string;
  valuator?: User;
  tokenId?: string;
  factors?: Record<string, number>;
  isOfficial: boolean;
  confidenceScore?: number;
  methodology?: string;
  notes?: string;
}

export default function ValuationReport({
  property,
  valuationAmount,
  valuationDate,
  valuator,
  tokenId,
  factors,
  isOfficial,
  confidenceScore,
  methodology,
  notes
}: ValuationReportProps) {
  const { t, language, changeLanguage } = useTranslation();
  const hederaContract = useHederaContract();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'failed' | null>(null);

  // Generate PDF when language changes
  useEffect(() => {
    if (previewOpen && !pdfUrl) {
      generatePDF();
    }
  }, [language, previewOpen]);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdfService = new PDFService(language as 'en' | 'es');
      
      const reportData: ValuationReportData = {
        property,
        valuationAmount,
        valuationDate,
        valuator,
        tokenId,
        factors,
        isOfficial,
        confidenceScore,
        methodology,
        notes
      };
      
      const pdfDataUrl = await pdfService.generateValuationReport(reportData);
      setPdfUrl(pdfDataUrl);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) {
      await generatePDF();
    }
    
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${isOfficial ? 'Official' : 'AI'}_Valuation_${property.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = async () => {
    if (!pdfUrl) {
      await generatePDF();
    }
    
    if (pdfUrl) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        if (!pdfUrl) {
          await generatePDF();
        }
        
        // Convert data URL to Blob
        const byteString = atob(pdfUrl!.split(',')[1]);
        const mimeString = pdfUrl!.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], `${isOfficial ? 'Official' : 'AI'}_Valuation_${property.id}.pdf`, { type: mimeString });
        
        await navigator.share({
          title: `${isOfficial ? 'Official' : 'AI'} Property Valuation`,
          text: `Property valuation for ${property.address.line1}, ${property.address.city}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Sharing failed. You can download the PDF and share it manually.');
      }
    } else {
      alert('Web Share API is not supported in your browser. You can download the PDF and share it manually.');
    }
  };

  const verifyOnBlockchain = async () => {
    if (!tokenId) {
      alert('This valuation has not been tokenized on the blockchain yet.');
      return;
    }
    
    setVerificationModalOpen(true);
    setVerificationStatus('loading');
    
    try {
      // In a real implementation, this would verify the valuation on the blockchain
      // For now, we'll simulate a verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful verification
      setVerificationStatus('verified');
    } catch (error) {
      console.error('Error verifying on blockchain:', error);
      setVerificationStatus('failed');
    }
  };

  return (
    <>
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={700} size="lg">
              {isOfficial ? t('valuation.official') : t('valuation.ai')}
            </Text>
            <Text size="sm" color="dimmed">
              {new Date(valuationDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
            </Text>
          </div>
          
          <Badge size="lg" color={isOfficial ? 'green' : 'blue'}>
            ${valuationAmount.toLocaleString()}
          </Badge>
        </Group>
        
        {tokenId && (
          <Group gap="xs" mb="md">
            <IconCertificate size={16} />
            <Text size="sm">
              {t('valuation.verify')}:{' '}
              <Text component="span" fw={500} style={{ wordBreak: 'break-all' }}>
                {tokenId}
              </Text>
            </Text>
          </Group>
        )}
        
        <Divider my="md" />
        
        <Group justify="space-between">
          <Button leftSection={<IconDownload size={16} />} onClick={() => setPreviewOpen(true)}>
            {t('valuation.download')}
          </Button>
          
          <Group gap="xs">
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="default" size="lg">
                  <IconShare size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconDownload size={14} />} onClick={handleDownload}>
                  {language === 'es' ? 'Descargar PDF' : 'Download PDF'}
                </Menu.Item>
                <Menu.Item leftSection={<IconPrinter size={14} />} onClick={handlePrint}>
                  {language === 'es' ? 'Imprimir' : 'Print'}
                </Menu.Item>
                <Menu.Item leftSection={<IconShare size={14} />} onClick={handleShare}>
                  {language === 'es' ? 'Compartir' : 'Share'}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            
            <Tooltip label={t('valuation.verify')}>
              <ActionIcon 
                variant="default" 
                size="lg" 
                onClick={verifyOnBlockchain}
                disabled={!tokenId}
              >
                <IconCertificate size={16} />
              </ActionIcon>
            </Tooltip>
            
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="default" size="lg">
                  <IconLanguage size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item 
                  onClick={() => changeLanguage('en')}
                  leftSection={<Badge size="xs" color={language === 'en' ? 'blue' : 'gray'}>EN</Badge>}
                >
                  English
                </Menu.Item>
                <Menu.Item 
                  onClick={() => changeLanguage('es')}
                  leftSection={<Badge size="xs" color={language === 'es' ? 'blue' : 'gray'}>ES</Badge>}
                >
                  Español
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Paper>
      
      {/* PDF Preview Modal */}
      <Modal
        opened={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={isOfficial ? t('valuation.official') : t('valuation.ai')}
        size="xl"
        fullScreen
      >
        {isGenerating ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ textAlign: 'center' }}>
              <Loader size="xl" />
              <Text mt="md">{language === 'es' ? 'Generando PDF...' : 'Generating PDF...'}</Text>
            </div>
          </div>
        ) : pdfUrl ? (
          <div style={{ height: '80vh' }}>
            <iframe 
              src={pdfUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title="Valuation Report"
            />
          </div>
        ) : (
          <Text>{language === 'es' ? 'Error al generar el PDF' : 'Error generating PDF'}</Text>
        )}
        
        <Group justify="space-between" mt="md">
          <Button variant="default" onClick={() => setPreviewOpen(false)}>
            {language === 'es' ? 'Cerrar' : 'Close'}
          </Button>
          
          <Group>
            <Button leftSection={<IconDownload size={16} />} onClick={handleDownload}>
              {language === 'es' ? 'Descargar' : 'Download'}
            </Button>
            <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint}>
              {language === 'es' ? 'Imprimir' : 'Print'}
            </Button>
          </Group>
        </Group>
      </Modal>
      
      {/* Blockchain Verification Modal */}
      <Modal
        opened={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        title={t('valuation.verify')}
        size="md"
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {verificationStatus === 'loading' && (
            <>
              <Loader size="xl" />
              <Text mt="md">{language === 'es' ? 'Verificando en la blockchain...' : 'Verifying on blockchain...'}</Text>
            </>
          )}
          
          {verificationStatus === 'verified' && (
            <>
              <Box
                style={(theme) => ({
                  backgroundColor: theme.colors.green[0],
                  color: theme.colors.green[9],
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.xl,
                })}
              >
                <IconCheck size={50} stroke={1.5} />
                <Text size="xl" fw={700} mt="md">
                  {language === 'es' ? '¡Verificado!' : 'Verified!'}
                </Text>
                <Text mt="xs">
                  {language === 'es' 
                    ? 'Esta valoración ha sido verificada en la blockchain Hedera.' 
                    : 'This valuation has been verified on the Hedera blockchain.'}
                </Text>
              </Box>
              
              <Group mt="xl">
                <div style={{ textAlign: 'left' }}>
                  <Text size="sm" color="dimmed">{language === 'es' ? 'Token ID' : 'Token ID'}</Text>
                  <Text fw={500}>{tokenId}</Text>
                </div>
                
                <div style={{ textAlign: 'left' }}>
                  <Text size="sm" color="dimmed">{language === 'es' ? 'Fecha de Verificación' : 'Verification Date'}</Text>
                  <Text fw={500}>{new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</Text>
                </div>
              </Group>
              
              <Button 
                component="a"
                href={`https://hashscan.io/testnet/token/${tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                mt="xl"
                leftSection={<IconCertificate size={16} />}
              >
                {language === 'es' ? 'Ver en HashScan' : 'View on HashScan'}
              </Button>
            </>
          )}
          
          {verificationStatus === 'failed' && (
            <>
              <Box
                style={(theme) => ({
                  backgroundColor: theme.colors.red[0],
                  color: theme.colors.red[9],
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.xl,
                })}
              >
                <IconInfoCircle size={50} stroke={1.5} />
                <Text size="xl" fw={700} mt="md">
                  {language === 'es' ? 'Verificación Fallida' : 'Verification Failed'}
                </Text>
                <Text mt="xs">
                  {language === 'es' 
                    ? 'No pudimos verificar esta valoración en la blockchain Hedera.' 
                    : 'We couldn\'t verify this valuation on the Hedera blockchain.'}
                </Text>
              </Box>
              
              <Button 
                variant="outline"
                mt="xl"
                onClick={() => verifyOnBlockchain()}
              >
                {language === 'es' ? 'Intentar de Nuevo' : 'Try Again'}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
