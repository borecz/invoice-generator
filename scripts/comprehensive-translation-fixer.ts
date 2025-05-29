#!/usr/bin/env node

/**
 * Comprehensive Translation Fixer
 *
 * This script fixes all remaining 39 placeholder translations across all locales
 * with proper, professional translations for invoice management functionality.
 */

import fs from "fs";
import path from "path";

const MESSAGES_DIR = path.join(process.cwd(), "messages");

// Comprehensive translation mappings for all 39 remaining placeholder keys
const translations = {
  // Invoice Actions (23 keys)
  "invoices.actions.view": {
    cs: "Zobrazit",
    da: "Vis",
    de: "Anzeigen",
    el: "Προβολή",
    es: "Ver",
    fi: "Näytä",
    fr: "Voir",
    hu: "Megtekintés",
    it: "Visualizza",
    nl: "Bekijken",
    pl: "Zobacz",
    pt: "Ver",
    ru: "Просмотр",
    sv: "Visa",
  },
  "invoices.actions.edit": {
    cs: "Upravit",
    da: "Rediger",
    de: "Bearbeiten",
    el: "Επεξεργασία",
    es: "Editar",
    fi: "Muokkaa",
    fr: "Modifier",
    hu: "Szerkesztés",
    it: "Modifica",
    nl: "Bewerken",
    pl: "Edytuj",
    pt: "Editar",
    ru: "Редактировать",
    sv: "Redigera",
  },
  "invoices.actions.duplicate": {
    cs: "Duplikovat",
    da: "Duplikér",
    de: "Duplizieren",
    el: "Αντιγραφή",
    es: "Duplicar",
    fi: "Kopioi",
    fr: "Dupliquer",
    hu: "Másolás",
    it: "Duplica",
    nl: "Dupliceren",
    pl: "Duplikuj",
    pt: "Duplicar",
    ru: "Дублировать",
    sv: "Duplicera",
  },
  "invoices.actions.archive": {
    cs: "Archivovat",
    da: "Arkivér",
    de: "Archivieren",
    el: "Αρχειοθέτηση",
    es: "Archivar",
    fi: "Arkistoi",
    fr: "Archiver",
    hu: "Archiválás",
    it: "Archivia",
    nl: "Archiveren",
    pl: "Archiwizuj",
    pt: "Arquivar",
    ru: "Архивировать",
    sv: "Arkivera",
  },
  "invoices.actions.unarchive": {
    cs: "Obnovit z archivu",
    da: "Gendan fra arkiv",
    de: "Aus Archiv wiederherstellen",
    el: "Επαναφορά από αρχείο",
    es: "Desarchivar",
    fi: "Palauta arkistosta",
    fr: "Désarchiver",
    hu: "Visszaállítás archívumból",
    it: "Ripristina da archivio",
    nl: "Uit archief halen",
    pl: "Przywróć z archiwum",
    pt: "Desarquivar",
    ru: "Восстановить из архива",
    sv: "Återställ från arkiv",
  },
  "invoices.actions.delete": {
    cs: "Smazat",
    da: "Slet",
    de: "Löschen",
    el: "Διαγραφή",
    es: "Eliminar",
    fi: "Poista",
    fr: "Supprimer",
    hu: "Törlés",
    it: "Elimina",
    nl: "Verwijderen",
    pl: "Usuń",
    pt: "Excluir",
    ru: "Удалить",
    sv: "Radera",
  },
  "invoices.actions.restore": {
    cs: "Obnovit",
    da: "Gendan",
    de: "Wiederherstellen",
    el: "Επαναφορά",
    es: "Restaurar",
    fi: "Palauta",
    fr: "Restaurer",
    hu: "Visszaállítás",
    it: "Ripristina",
    nl: "Herstellen",
    pl: "Przywróć",
    pt: "Restaurar",
    ru: "Восстановить",
    sv: "Återställ",
  },
  "invoices.actions.deletePermanently": {
    cs: "Smazat trvale",
    da: "Slet permanent",
    de: "Dauerhaft löschen",
    el: "Οριστική διαγραφή",
    es: "Eliminar permanentemente",
    fi: "Poista pysyvästi",
    fr: "Supprimer définitivement",
    hu: "Végleges törlés",
    it: "Elimina definitivamente",
    nl: "Permanent verwijderen",
    pl: "Usuń na zawsze",
    pt: "Excluir permanentemente",
    ru: "Удалить навсегда",
    sv: "Radera permanent",
  },
  "invoices.actions.downloadPdf": {
    cs: "Stáhnout PDF",
    da: "Download PDF",
    de: "PDF herunterladen",
    el: "Λήψη PDF",
    es: "Descargar PDF",
    fi: "Lataa PDF",
    fr: "Télécharger PDF",
    hu: "PDF letöltése",
    it: "Scarica PDF",
    nl: "PDF downloaden",
    pl: "Pobierz PDF",
    pt: "Baixar PDF",
    ru: "Скачать PDF",
    sv: "Ladda ner PDF",
  },
  "invoices.actions.sendEmail": {
    cs: "Odeslat e-mail",
    da: "Send e-mail",
    de: "E-Mail senden",
    el: "Αποστολή email",
    es: "Enviar correo",
    fi: "Lähetä sähköposti",
    fr: "Envoyer un e-mail",
    hu: "E-mail küldése",
    it: "Invia email",
    nl: "E-mail verzenden",
    pl: "Wyślij e-mail",
    pt: "Enviar e-mail",
    ru: "Отправить email",
    sv: "Skicka e-post",
  },
  "invoices.actions.sharePublicLink": {
    cs: "Sdílet veřejný odkaz",
    da: "Del offentligt link",
    de: "Öffentlichen Link teilen",
    el: "Κοινοποίηση δημόσιου συνδέσμου",
    es: "Compartir enlace público",
    fi: "Jaa julkinen linkki",
    fr: "Partager le lien public",
    hu: "Nyilvános link megosztása",
    it: "Condividi link pubblico",
    nl: "Openbare link delen",
    pl: "Udostępnij publiczny link",
    pt: "Compartilhar link público",
    ru: "Поделиться публичной ссылкой",
    sv: "Dela offentlig länk",
  },
  "invoices.actions.markAsSent": {
    cs: "Označit jako odesláno",
    da: "Markér som sendt",
    de: "Als gesendet markieren",
    el: "Σήμανση ως απεσταλμένο",
    es: "Marcar como enviado",
    fi: "Merkitse lähetetyksi",
    fr: "Marquer comme envoyé",
    hu: "Megjelölés elküldöttként",
    it: "Segna come inviato",
    nl: "Markeren als verzonden",
    pl: "Oznacz jako wysłane",
    pt: "Marcar como enviado",
    ru: "Отметить как отправленное",
    sv: "Markera som skickad",
  },
  "invoices.actions.openActionsMenu": {
    cs: "Otevřít nabídku akcí",
    da: "Åbn handlingsmenu",
    de: "Aktionsmenü öffnen",
    el: "Άνοιγμα μενού ενεργειών",
    es: "Abrir menú de acciones",
    fi: "Avaa toimintovalikko",
    fr: "Ouvrir le menu d'actions",
    hu: "Műveletek menü megnyitása",
    it: "Apri menu azioni",
    nl: "Actiemenu openen",
    pl: "Otwórz menu akcji",
    pt: "Abrir menu de ações",
    ru: "Открыть меню действий",
    sv: "Öppna åtgärdsmeny",
  },
  "invoices.actions.duplicateSuccess": {
    cs: "Faktura {number} byla úspěšně duplikována",
    da: "Faktura {number} duplikeret med succes",
    de: "Rechnung {number} erfolgreich dupliziert",
    el: "Το τιμολόγιο {number} αντιγράφηκε επιτυχώς",
    es: "Factura {number} duplicada exitosamente",
    fi: "Lasku {number} kopioitu onnistuneesti",
    fr: "Facture {number} dupliquée avec succès",
    hu: "A(z) {number} számla sikeresen másolva",
    it: "Fattura {number} duplicata con successo",
    nl: "Factuur {number} succesvol gedupliceerd",
    pl: "Faktura {number} została pomyślnie zduplikowana",
    pt: "Fatura {number} duplicada com sucesso",
    ru: "Счёт {number} успешно дублирован",
    sv: "Faktura {number} duplicerad framgångsrikt",
  },
  "invoices.actions.archiveSuccess": {
    cs: "Faktura {number} byla úspěšně archivována",
    da: "Faktura {number} arkiveret med succes",
    de: "Rechnung {number} erfolgreich archiviert",
    el: "Το τιμολόγιο {number} αρχειοθετήθηκε επιτυχώς",
    es: "Factura {number} archivada exitosamente",
    fi: "Lasku {number} arkistoitu onnistuneesti",
    fr: "Facture {number} archivée avec succès",
    hu: "A(z) {number} számla sikeresen archiválva",
    it: "Fattura {number} archiviata con successo",
    nl: "Factuur {number} succesvol gearchiveerd",
    pl: "Faktura {number} została pomyślnie zarchiwizowana",
    pt: "Fatura {number} arquivada com sucesso",
    ru: "Счёт {number} успешно архивирован",
    sv: "Faktura {number} arkiverad framgångsrikt",
  },
  "invoices.actions.unarchiveSuccess": {
    cs: "Faktura {number} byla úspěšně obnovena z archivu",
    da: "Faktura {number} gendannet fra arkiv med succes",
    de: "Rechnung {number} erfolgreich aus Archiv wiederhergestellt",
    el: "Το τιμολόγιο {number} επαναφέρθηκε από το αρχείο επιτυχώς",
    es: "Factura {number} desarchivada exitosamente",
    fi: "Lasku {number} palautettu arkistosta onnistuneesti",
    fr: "Facture {number} désarchivée avec succès",
    hu: "A(z) {number} számla sikeresen visszaállítva az archívumból",
    it: "Fattura {number} ripristinata da archivio con successo",
    nl: "Factuur {number} succesvol uit archief gehaald",
    pl: "Faktura {number} została pomyślnie przywrócona z archiwum",
    pt: "Fatura {number} desarquivada com sucesso",
    ru: "Счёт {number} успешно восстановлен из архива",
    sv: "Faktura {number} återställd från arkiv framgångsrikt",
  },
  "invoices.actions.deleteSuccess": {
    cs: "Faktura {number} byla přesunuta do koše",
    da: "Faktura {number} flyttet til papirkurv",
    de: "Rechnung {number} in Papierkorb verschoben",
    el: "Το τιμολόγιο {number} μετακινήθηκε στον κάδο",
    es: "Factura {number} movida a la papelera",
    fi: "Lasku {number} siirretty roskakoriin",
    fr: "Facture {number} déplacée vers la corbeille",
    hu: "A(z) {number} számla a lomtárba helyezve",
    it: "Fattura {number} spostata nel cestino",
    nl: "Factuur {number} verplaatst naar prullenbak",
    pl: "Faktura {number} została przeniesiona do kosza",
    pt: "Fatura {number} movida para a lixeira",
    ru: "Счёт {number} перемещён в корзину",
    sv: "Faktura {number} flyttad till papperskorgen",
  },
  "invoices.actions.markAsSentSuccess": {
    cs: "Faktura {number} byla označena jako odeslaná",
    da: "Faktura {number} markeret som sendt",
    de: "Rechnung {number} als gesendet markiert",
    el: "Το τιμολόγιο {number} σημάνθηκε ως απεσταλμένο",
    es: "Factura {number} marcada como enviada",
    fi: "Lasku {number} merkitty lähetetyksi",
    fr: "Facture {number} marquée comme envoyée",
    hu: "A(z) {number} számla elküldöttként megjelölve",
    it: "Fattura {number} segnata come inviata",
    nl: "Factuur {number} gemarkeerd als verzonden",
    pl: "Faktura {number} została oznaczona jako wysłana",
    pt: "Fatura {number} marcada como enviada",
    ru: "Счёт {number} отмечен как отправленный",
    sv: "Faktura {number} markerad som skickad",
  },
  "invoices.actions.deleteConfirmTitle": {
    cs: "Smazat fakturu",
    da: "Slet faktura",
    de: "Rechnung löschen",
    el: "Διαγραφή τιμολογίου",
    es: "Eliminar factura",
    fi: "Poista lasku",
    fr: "Supprimer la facture",
    hu: "Számla törlése",
    it: "Elimina fattura",
    nl: "Factuur verwijderen",
    pl: "Usuń fakturę",
    pt: "Excluir fatura",
    ru: "Удалить счёт",
    sv: "Radera faktura",
  },
  "invoices.actions.deleteConfirmDescription": {
    cs: "Opravdu chcete smazat fakturu {number} pro {customer}? Bude přesunuta do koše, odkud ji můžete obnovit po dobu 30 dnů.",
    da: "Er du sikker på, at du vil slette faktura {number} for {customer}? Den vil blive flyttet til papirkurven, hvor den kan gendannes i 30 dage.",
    de: "Sind Sie sicher, dass Sie Rechnung {number} für {customer} löschen möchten? Sie wird in den Papierkorb verschoben und kann 30 Tage lang wiederhergestellt werden.",
    el: "Είστε βέβαιοι ότι θέλετε να διαγράψετε το τιμολόγιο {number} για {customer}; Θα μετακινηθεί στον κάδο όπου μπορεί να επαναφερθεί για 30 ημέρες.",
    es: "¿Está seguro de que desea eliminar la factura {number} para {customer}? Se moverá a la papelera donde puede restaurarse durante 30 días.",
    fi: "Haluatko varmasti poistaa laskun {number} asiakkaalle {customer}? Se siirretään roskakoriin, josta se voidaan palauttaa 30 päivän ajan.",
    fr: "Êtes-vous sûr de vouloir supprimer la facture {number} pour {customer} ? Elle sera déplacée vers la corbeille où elle pourra être restaurée pendant 30 jours.",
    hu: "Biztosan törölni szeretné a(z) {number} számlát {customer} számára? A lomtárba kerül, ahonnan 30 napig visszaállítható.",
    it: "Sei sicuro di voler eliminare la fattura {number} per {customer}? Verrà spostata nel cestino dove potrà essere ripristinata per 30 giorni.",
    nl: "Weet u zeker dat u factuur {number} voor {customer} wilt verwijderen? Deze wordt verplaatst naar de prullenbak waar deze 30 dagen kan worden hersteld.",
    pl: "Czy na pewno chcesz usunąć fakturę {number} dla {customer}? Zostanie przeniesiona do kosza, skąd można ją przywrócić przez 30 dni.",
    pt: "Tem certeza de que deseja excluir a fatura {number} para {customer}? Ela será movida para a lixeira onde pode ser restaurada por 30 dias.",
    ru: "Вы уверены, что хотите удалить счёт {number} для {customer}? Он будет перемещён в корзину, откуда его можно восстановить в течение 30 дней.",
    sv: "Är du säker på att du vill radera faktura {number} för {customer}? Den kommer att flyttas till papperskorgen där den kan återställas i 30 dagar.",
  },
  "invoices.actions.emailFeatureComingSoon": {
    cs: "Funkce odesílání e-mailů již brzy!",
    da: "E-mail afsendelse funktion kommer snart!",
    de: "E-Mail-Versand-Funktion kommt bald!",
    el: "Η λειτουργία αποστολής email έρχεται σύντομα!",
    es: "¡Función de envío de correo próximamente!",
    fi: "Sähköpostin lähetys tulossa pian!",
    fr: "Fonction d'envoi d'e-mail bientôt disponible !",
    hu: "E-mail küldés funkció hamarosan!",
    it: "Funzione invio email in arrivo!",
    nl: "E-mail verzending binnenkort beschikbaar!",
    pl: "Funkcja wysyłania e-maili wkrótce!",
    pt: "Função de envio de e-mail em breve!",
    ru: "Функция отправки email скоро!",
    sv: "E-post sändning kommer snart!",
  },
  "invoices.actions.shareFeatureComingSoon": {
    cs: "Funkce veřejného sdílení již brzy!",
    da: "Offentlig deling funktion kommer snart!",
    de: "Öffentliche Freigabe-Funktion kommt bald!",
    el: "Η λειτουργία δημόσιας κοινοποίησης έρχεται σύντομα!",
    es: "¡Función de compartir público próximamente!",
    fi: "Julkinen jakaminen tulossa pian!",
    fr: "Fonction de partage public bientôt disponible !",
    hu: "Nyilvános megosztás funkció hamarosan!",
    it: "Funzione condivisione pubblica in arrivo!",
    nl: "Openbare delen functie binnenkort beschikbaar!",
    pl: "Funkcja publicznego udostępniania wkrótce!",
    pt: "Função de compartilhamento público em breve!",
    ru: "Функция публичного доступа скоро!",
    sv: "Offentlig delning kommer snart!",
  },
  "invoices.actions.downloadFeatureComingSoon": {
    cs: "Funkce stahování PDF již brzy!",
    da: "PDF download funktion kommer snart!",
    de: "PDF-Download-Funktion kommt bald!",
    el: "Η λειτουργία λήψης PDF έρχεται σύντομα!",
    es: "¡Función de descarga PDF próximamente!",
    fi: "PDF lataus tulossa pian!",
    fr: "Fonction de téléchargement PDF bientôt disponible !",
    hu: "PDF letöltés funkció hamarosan!",
    it: "Funzione download PDF in arrivo!",
    nl: "PDF download functie binnenkort beschikbaar!",
    pl: "Funkcja pobierania PDF wkrótce!",
    pt: "Função de download PDF em breve!",
    ru: "Функция скачивания PDF скоро!",
    sv: "PDF nedladdning kommer snart!",
  },
  // Invoice Management (16 keys)
  "invoices.management.invoiceManagement": {
    cs: "Správa faktur",
    da: "Faktura administration",
    de: "Rechnungsverwaltung",
    el: "Διαχείριση τιμολογίων",
    es: "Gestión de facturas",
    fi: "Laskujen hallinta",
    fr: "Gestion des factures",
    hu: "Számla kezelés",
    it: "Gestione fatture",
    nl: "Factuurbeheer",
    pl: "Zarządzanie fakturami",
    pt: "Gestão de faturas",
    ru: "Управление счетами",
    sv: "Fakturahantering",
  },
  "invoices.management.manageAllInvoices": {
    cs: "Spravujte všechny své faktury, archivované položky a koš",
    da: "Administrer alle dine fakturaer, arkiverede elementer og papirkurv",
    de: "Verwalten Sie alle Ihre Rechnungen, archivierten Elemente und den Papierkorb",
    el: "Διαχειριστείτε όλα τα τιμολόγιά σας, αρχειοθετημένα στοιχεία και κάδο",
    es: "Gestiona todas tus facturas, elementos archivados y papelera",
    fi: "Hallitse kaikkia laskujasi, arkistoituja kohteita ja roskakoria",
    fr: "Gérez toutes vos factures, éléments archivés et corbeille",
    hu: "Kezelje összes számláját, archivált elemeit és lomtárát",
    it: "Gestisci tutte le tue fatture, elementi archiviati e cestino",
    nl: "Beheer al uw facturen, gearchiveerde items en prullenbak",
    pl: "Zarządzaj wszystkimi fakturami, zarchiwizowanymi elementami i koszem",
    pt: "Gerencie todas as suas faturas, itens arquivados e lixeira",
    ru: "Управляйте всеми счетами, архивированными элементами и корзиной",
    sv: "Hantera alla dina fakturor, arkiverade objekt och papperskorg",
  },
  "invoices.management.active": {
    cs: "Aktivní",
    da: "Aktiv",
    de: "Aktiv",
    el: "Ενεργό",
    es: "Activo",
    fi: "Aktiivinen",
    fr: "Actif",
    hu: "Aktív",
    it: "Attivo",
    nl: "Actief",
    pl: "Aktywne",
    pt: "Ativo",
    ru: "Активные",
    sv: "Aktiv",
  },
  "invoices.management.archived": {
    cs: "Archivované",
    da: "Arkiveret",
    de: "Archiviert",
    el: "Αρχειοθετημένα",
    es: "Archivado",
    fi: "Arkistoitu",
    fr: "Archivé",
    hu: "Archivált",
    it: "Archiviato",
    nl: "Gearchiveerd",
    pl: "Zarchiwizowane",
    pt: "Arquivado",
    ru: "Архивированные",
    sv: "Arkiverad",
  },
  "invoices.management.trash": {
    cs: "Koš",
    da: "Papirkurv",
    de: "Papierkorb",
    el: "Κάδος",
    es: "Papelera",
    fi: "Roskakori",
    fr: "Corbeille",
    hu: "Lomtár",
    it: "Cestino",
    nl: "Prullenbak",
    pl: "Kosz",
    pt: "Lixeira",
    ru: "Корзина",
    sv: "Papperskorg",
  },
  "invoices.management.refresh": {
    cs: "Obnovit",
    da: "Opdater",
    de: "Aktualisieren",
    el: "Ανανέωση",
    es: "Actualizar",
    fi: "Päivitä",
    fr: "Actualiser",
    hu: "Frissítés",
    it: "Aggiorna",
    nl: "Vernieuwen",
    pl: "Odśwież",
    pt: "Atualizar",
    ru: "Обновить",
    sv: "Uppdatera",
  },
  "invoices.management.filter": {
    cs: "Filtrovat",
    da: "Filtrer",
    de: "Filtern",
    el: "Φίλτρο",
    es: "Filtrar",
    fi: "Suodata",
    fr: "Filtrer",
    hu: "Szűrés",
    it: "Filtra",
    nl: "Filteren",
    pl: "Filtruj",
    pt: "Filtrar",
    ru: "Фильтр",
    sv: "Filtrera",
  },
  "invoices.management.export": {
    cs: "Exportovat",
    da: "Eksporter",
    de: "Exportieren",
    el: "Εξαγωγή",
    es: "Exportar",
    fi: "Vie",
    fr: "Exporter",
    hu: "Exportálás",
    it: "Esporta",
    nl: "Exporteren",
    pl: "Eksportuj",
    pt: "Exportar",
    ru: "Экспорт",
    sv: "Exportera",
  },
  "invoices.management.newInvoice": {
    cs: "Nová faktura",
    da: "Ny faktura",
    de: "Neue Rechnung",
    el: "Νέο τιμολόγιο",
    es: "Nueva factura",
    fi: "Uusi lasku",
    fr: "Nouvelle facture",
    hu: "Új számla",
    it: "Nuova fattura",
    nl: "Nieuwe factuur",
    pl: "Nowa faktura",
    pt: "Nova fatura",
    ru: "Новый счёт",
    sv: "Ny faktura",
  },
  "invoices.management.noInvoicesFound": {
    cs: "Žádné faktury nenalezeny",
    da: "Ingen fakturaer fundet",
    de: "Keine Rechnungen gefunden",
    el: "Δεν βρέθηκαν τιμολόγια",
    es: "No se encontraron facturas",
    fi: "Laskuja ei löytynyt",
    fr: "Aucune facture trouvée",
    hu: "Nem találhatók számlák",
    it: "Nessuna fattura trovata",
    nl: "Geen facturen gevonden",
    pl: "Nie znaleziono faktur",
    pt: "Nenhuma fatura encontrada",
    ru: "Счета не найдены",
    sv: "Inga fakturor hittades",
  },
  "invoices.management.createFirstInvoice": {
    cs: "Vytvořte svou první fakturu pro začátek",
    da: "Opret din første faktura for at komme i gang",
    de: "Erstellen Sie Ihre erste Rechnung, um zu beginnen",
    el: "Δημιουργήστε το πρώτο σας τιμολόγιο για να ξεκινήσετε",
    es: "Crea tu primera factura para comenzar",
    fi: "Luo ensimmäinen laskusi aloittaaksesi",
    fr: "Créez votre première facture pour commencer",
    hu: "Hozza létre első számláját a kezdéshez",
    it: "Crea la tua prima fattura per iniziare",
    nl: "Maak uw eerste factuur om te beginnen",
    pl: "Utwórz swoją pierwszą fakturę, aby rozpocząć",
    pt: "Crie sua primeira fatura para começar",
    ru: "Создайте свой первый счёт для начала",
    sv: "Skapa din första faktura för att komma igång",
  },
  "invoices.management.noArchivedInvoices": {
    cs: "Žádné archivované faktury",
    da: "Ingen arkiverede fakturaer",
    de: "Keine archivierten Rechnungen",
    el: "Δεν υπάρχουν αρχειοθετημένα τιμολόγια",
    es: "No hay facturas archivadas",
    fi: "Ei arkistoituja laskuja",
    fr: "Aucune facture archivée",
    hu: "Nincsenek archivált számlák",
    it: "Nessuna fattura archiviata",
    nl: "Geen gearchiveerde facturen",
    pl: "Brak zarchiwizowanych faktur",
    pt: "Nenhuma fatura arquivada",
    ru: "Нет архивированных счетов",
    sv: "Inga arkiverade fakturor",
  },
  "invoices.management.noDeletedInvoices": {
    cs: "Žádné smazané faktury",
    da: "Ingen slettede fakturaer",
    de: "Keine gelöschten Rechnungen",
    el: "Δεν υπάρχουν διαγραμμένα τιμολόγια",
    es: "No hay facturas eliminadas",
    fi: "Ei poistettuja laskuja",
    fr: "Aucune facture supprimée",
    hu: "Nincsenek törölt számlák",
    it: "Nessuna fattura eliminata",
    nl: "Geen verwijderde facturen",
    pl: "Brak usuniętych faktur",
    pt: "Nenhuma fatura excluída",
    ru: "Нет удалённых счетов",
    sv: "Inga raderade fakturor",
  },
  "invoices.management.failedToLoadInvoices": {
    cs: "Nepodařilo se načíst faktury",
    da: "Kunne ikke indlæse fakturaer",
    de: "Rechnungen konnten nicht geladen werden",
    el: "Αποτυχία φόρτωσης τιμολογίων",
    es: "Error al cargar facturas",
    fi: "Laskujen lataaminen epäonnistui",
    fr: "Échec du chargement des factures",
    hu: "A számlák betöltése sikertelen",
    it: "Caricamento fatture fallito",
    nl: "Facturen laden mislukt",
    pl: "Nie udało się załadować faktur",
    pt: "Falha ao carregar faturas",
    ru: "Не удалось загрузить счета",
    sv: "Misslyckades att ladda fakturor",
  },
  "invoices.management.invoiceRestored": {
    cs: "Faktura byla úspěšně obnovena",
    da: "Faktura gendannet med succes",
    de: "Rechnung erfolgreich wiederhergestellt",
    el: "Το τιμολόγιο επαναφέρθηκε επιτυχώς",
    es: "Factura restaurada exitosamente",
    fi: "Lasku palautettu onnistuneesti",
    fr: "Facture restaurée avec succès",
    hu: "Számla sikeresen visszaállítva",
    it: "Fattura ripristinata con successo",
    nl: "Factuur succesvol hersteld",
    pl: "Faktura została pomyślnie przywrócona",
    pt: "Fatura restaurada com sucesso",
    ru: "Счёт успешно восстановлен",
    sv: "Faktura återställd framgångsrikt",
  },
  "invoices.management.invoicePermanentlyDeleted": {
    cs: "Faktura byla trvale smazána",
    da: "Faktura permanent slettet",
    de: "Rechnung dauerhaft gelöscht",
    el: "Το τιμολόγιο διαγράφηκε οριστικά",
    es: "Factura eliminada permanentemente",
    fi: "Lasku poistettu pysyvästi",
    fr: "Facture supprimée définitivement",
    hu: "Számla véglegesen törölve",
    it: "Fattura eliminata definitivamente",
    nl: "Factuur permanent verwijderd",
    pl: "Faktura została trwale usunięta",
    pt: "Fatura excluída permanentemente",
    ru: "Счёт удалён навсегда",
    sv: "Faktura raderad permanent",
  },
};

class ComprehensiveTranslationFixer {
  fixFile(locale: string): void {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${locale}.json`);
      return;
    }

    console.log(`\n🔧 Fixing all placeholders in ${locale}.json...`);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      let updatedContent = content;
      let changesCount = 0;

      // Fix all placeholder translations
      for (const [key, localeTranslations] of Object.entries(translations)) {
        const placeholderPattern = `"[${locale.toUpperCase()}] ${key}"`;
        const translation =
          localeTranslations[locale as keyof typeof localeTranslations];

        if (updatedContent.includes(placeholderPattern) && translation) {
          updatedContent = updatedContent.replace(
            placeholderPattern,
            `"${translation}"`
          );
          changesCount++;
          console.log(`  ✅ Fixed ${key}: "${translation}"`);
        }
      }

      if (changesCount > 0) {
        // Validate JSON before writing
        JSON.parse(updatedContent);

        fs.writeFileSync(filePath, updatedContent);
        console.log(
          `  📝 Updated ${changesCount} placeholder(s) in ${locale}.json`
        );
      } else {
        console.log(`  ℹ️  No placeholders found in ${locale}.json`);
      }
    } catch (error: any) {
      console.error(
        `❌ Failed to fix placeholders in ${locale}.json: ${error.message}`
      );
    }
  }

  fixAllFiles(): void {
    console.log(
      "🔧 Starting comprehensive placeholder fix for all locale files..."
    );
    console.log(
      `📊 Will fix ${
        Object.keys(translations).length
      } placeholder keys across all locales`
    );

    const locales = Object.keys(translations[Object.keys(translations)[0]]);

    console.log(
      `Found ${locales.length} locales to process: ${locales.join(", ")}`
    );

    for (const locale of locales) {
      this.fixFile(locale);
    }

    console.log("\n✨ Comprehensive placeholder fixing complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Run validation: npm run validate:translations");
    console.log("2. Run tests: npm run test:run -- src/tests/i18n.test.ts");
    console.log("3. Verify the changes and commit");
  }

  showStats(): void {
    console.log("📊 Translation Statistics:");
    console.log(`Total placeholder keys: ${Object.keys(translations).length}`);
    console.log(
      `Total locales: ${
        Object.keys(translations[Object.keys(translations)[0]]).length
      }`
    );
    console.log(
      `Total translations to fix: ${
        Object.keys(translations).length *
        Object.keys(translations[Object.keys(translations)[0]]).length
      }`
    );

    console.log("\n📋 Placeholder categories:");
    const actionKeys = Object.keys(translations).filter((key) =>
      key.startsWith("invoices.actions.")
    ).length;
    const managementKeys = Object.keys(translations).filter((key) =>
      key.startsWith("invoices.management.")
    ).length;

    console.log(`  Invoice Actions: ${actionKeys} keys`);
    console.log(`  Invoice Management: ${managementKeys} keys`);
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new ComprehensiveTranslationFixer();

  const args = process.argv.slice(2);

  if (args.includes("--stats")) {
    fixer.showStats();
  } else if (args.length > 0 && !args[0].startsWith("--")) {
    // Fix specific locale
    const locale = args[0];
    fixer.fixFile(locale);
  } else {
    // Fix all locales
    fixer.fixAllFiles();
  }
}

export default ComprehensiveTranslationFixer;
