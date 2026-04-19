import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'public', 'locales');
const langs = ['az', 'en', 'ru', 'tr'];

const addedKeys = {
  az: {
      "title": "Tənzimləmələr",
      "account": "Hesab",
      "password": "Şifrəni Dəyiş",
      "oldPassword": "Cari Şifrə",
      "newPassword": "Yeni Şifrə",
      "confirmPassword": "Yeni Şifrə (Təkrar)",
      "changePasswordBtn": "Şifrəni Yenilə",
      "language": "Dil",
      "notifications": "Bildirişlər",
      "emailNotifications": "E-poçt bildirişləri",
      "pushNotifications": "Tətbiqdaxili bildirişlər",
      "dangerZone": "Təhlükə Zonası",
      "deleteAccount": "Hesabı Sil",
      "deleteAccountDesc": "Hesabınızı və bütün məlumatlarınızı həmişəlik silin. Bu əməliyyat geri alınmaz.",
      "deleteAccountBtn": "Hesabımı Sil",
      "deleteConfirmTitle": "Əminsiniz?",
      "deleteConfirmDesc": "Hesabınız həmişəlik silinəcək. Davam etmək istədiyinizə əminsiniz?",
      "success": "Ayarlar yadda saxlanıldı",
      "pwdSuccess": "Şifrə uğurla dəyişdirildi",
      "pwdError": "Cari şifrə yanlışdır",
      "pwdMismatch": "Yeni şifrələr uyğun gəlmir",
      "save": "Yadda Saxla"
  },
  en: {
      "title": "Settings",
      "account": "Account",
      "password": "Change Password",
      "oldPassword": "Current Password",
      "newPassword": "New Password",
      "confirmPassword": "Confirm New Password",
      "changePasswordBtn": "Update Password",
      "language": "Language",
      "notifications": "Notifications",
      "emailNotifications": "Email notifications",
      "pushNotifications": "Push notifications",
      "dangerZone": "Danger Zone",
      "deleteAccount": "Delete Account",
      "deleteAccountDesc": "Permanently delete your account and all data. This action cannot be undone.",
      "deleteAccountBtn": "Delete My Account",
      "deleteConfirmTitle": "Are you sure?",
      "deleteConfirmDesc": "Your account will be permanently deleted. Are you sure you want to continue?",
      "success": "Settings saved",
      "pwdSuccess": "Password changed successfully",
      "pwdError": "Current password is wrong",
      "pwdMismatch": "New passwords do not match",
      "save": "Save"
  },
  tr: {
      "title": "Ayarlar",
      "account": "Hesap",
      "password": "Şifreyi Değiştir",
      "oldPassword": "Mevcut Şifre",
      "newPassword": "Yeni Şifre",
      "confirmPassword": "Yeni Şifre (Tekrar)",
      "changePasswordBtn": "Şifreyi Güncelle",
      "language": "Dil",
      "notifications": "Bildirimler",
      "emailNotifications": "E-posta bildirimleri",
      "pushNotifications": "Uygulama içi bildirimler",
      "dangerZone": "Tehlike Bölgesi",
      "deleteAccount": "Hesabı Sil",
      "deleteAccountDesc": "Hesabınızı ve tüm verilerinizi kalıcı olarak silin. Bu işlem geri alınamaz.",
      "deleteAccountBtn": "Hesabımı Sil",
      "deleteConfirmTitle": "Emin misiniz?",
      "deleteConfirmDesc": "Hesabınız kalıcı olarak silinecek. Devam etmek istediğinize emin misiniz?",
      "success": "Ayarlar kaydedildi",
      "pwdSuccess": "Şifre başarıyla değiştirildi",
      "pwdError": "Mevcut şifre yanlış",
      "pwdMismatch": "Yeni şifreler eşleşmiyor",
      "save": "Kaydet"
  },
  ru: {
      "title": "Настройки",
      "account": "Аккаунт",
      "password": "Изменить пароль",
      "oldPassword": "Текущий пароль",
      "newPassword": "Новый пароль",
      "confirmPassword": "Подтвердите новый пароль",
      "changePasswordBtn": "Обновить пароль",
      "language": "Язык",
      "notifications": "Уведомления",
      "emailNotifications": "Уведомления по электронной почте",
      "pushNotifications": "Push-уведомления",
      "dangerZone": "Опасная зона",
      "deleteAccount": "Удалить аккаунт",
      "deleteAccountDesc": "Навсегда удалите свой аккаунт и все данные. Это действие необратимо.",
      "deleteAccountBtn": "Удалить мой аккаунт",
      "deleteConfirmTitle": "Вы уверены?",
      "deleteConfirmDesc": "Ваш аккаунт будет навсегда удален. Вы уверены, что хотите продолжить?",
      "success": "Настройки сохранены",
      "pwdSuccess": "Пароль успешно изменен",
      "pwdError": "Текущий пароль неверен",
      "pwdMismatch": "Новые пароли не совпадают",
      "save": "Сохранить"
  }
};

for (const lang of langs) {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.settingsPage = addedKeys[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
console.log('Translations fixed.');
