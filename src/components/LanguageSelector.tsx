import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'malayalam', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bengali', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'english', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as={Button}
        variant="outline-success"
        size="sm"
        className="d-flex align-items-center border-0 bg-white shadow-sm"
        style={{ minWidth: '120px' }}
      >
        <Globe size={16} className="me-2" />
        <span className="me-1">{currentLanguage?.flag}</span>
        <span className="d-none d-sm-inline">{currentLanguage?.name}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-lg border-0">
        <Dropdown.Header className="text-muted small">
          Select Language
        </Dropdown.Header>
        {languages.map((lang) => (
          <Dropdown.Item
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            active={language === lang.code}
            className="d-flex align-items-center py-2"
          >
            <span className="me-2">{lang.flag}</span>
            {lang.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default LanguageSelector;