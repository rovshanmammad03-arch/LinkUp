import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'public', 'locales');
const langs = ['az', 'en', 'ru', 'tr'];

const addedKeys = {
  az: {
      "emailTitle": "E-poçt Ünvanı",
      "currentEmail": "Cari E-poçt",
      "newEmail": "Yeni E-poçt",
      "emailPassword": "Hesab Şifrəniz",
      "changeEmailBtn": "E-poçtu Yenilə",
      "emailSuccess": "E-poçt ünvanı uğurla dəyişdirildi",
      "emailExists": "Bu e-poçt ünvanı artıq istifadədədir"
  },
  en: {
      "emailTitle": "Email Address",
      "currentEmail": "Current Email",
      "newEmail": "New Email",
      "emailPassword": "Account Password",
      "changeEmailBtn": "Update Email",
      "emailSuccess": "Email address successfully updated",
      "emailExists": "This email address is already in use"
  },
  tr: {
      "emailTitle": "E-posta Adresi",
      "currentEmail": "Mevcut E-posta",
      "newEmail": "Yeni E-posta",
      "emailPassword": "Hesap Şifresi",
      "changeEmailBtn": "E-postayı Güncelle",
      "emailSuccess": "E-posta adresi başarıyla güncellendi",
      "emailExists": "Bu e-posta adresi zaten kullanılıyor"
  },
  ru: {
      "emailTitle": "Электронная почта",
      "currentEmail": "Текущий Email",
      "newEmail": "Новый Email",
      "emailPassword": "Пароль от аккаунта",
      "changeEmailBtn": "Обновить Email",
      "emailSuccess": "Электронная почта успешно обновлена",
      "emailExists": "Этот адрес электронной почты уже используется"
  }
};

for (const lang of langs) {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Merge new keys into settingsPage
    data.settingsPage = { ...data.settingsPage, ...addedKeys[lang] };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
console.log('Translations for email fixed.');
