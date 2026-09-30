import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { SCHOOL } from "@/lib/constants";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return {
    title: t("title"),
    description: t("description"),
  };
}

// ── English content ───────────────────────────────────────────────────────────

function PrivacyEn() {
  return (
    <div className="prose prose-lg max-w-none text-[var(--text-body)]">
      <p className="text-sm text-[var(--text-muted)]">Last updated: June 2026</p>

      <h2>1. Who we are</h2>
      <p>
        <strong>{SCHOOL.name}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a Cambridge-certified English
        language school located at {SCHOOL.address}. We are committed to protecting your personal
        data in accordance with Regulation (EU) 2016/679 (General Data Protection Regulation,
        &ldquo;GDPR&rdquo;).
      </p>

      <h2>2. What data we collect and why</h2>
      <p>We only collect personal data when you use our contact form:</p>
      <ul>
        <li><strong>Name and email address</strong> — to respond to your inquiry.</li>
        <li><strong>Phone number</strong> (optional) — if you would like us to call you back.</li>
        <li><strong>Message content</strong> — the details of your inquiry.</li>
        <li>
          <strong>IP address</strong> — recorded automatically for security purposes and to
          prevent spam.
        </li>
      </ul>
      <p>We do not collect any other personal data. We do not track website visitors.</p>

      <h2>3. Legal basis for processing</h2>
      <p>
        We process contact form data under <strong>legitimate interest</strong> (Article 6(1)(f)
        GDPR) — specifically, to respond to inquiries sent to us. You have the right to object to
        this processing at any time (see Section 6).
      </p>

      <h2>4. How long we keep your data</h2>
      <p>
        Contact form submissions are retained for up to <strong>12 months</strong> after the
        inquiry is resolved, after which they are permanently deleted.
      </p>

      <h2>5. Who we share your data with</h2>
      <p>
        We do not sell or share your personal data with third parties for marketing purposes.
        We use two service providers that process data on our behalf:
      </p>
      <ul>
        <li>
          <strong>Resend</strong> — transactional email delivery. Your name and email address
          are used solely to send you a confirmation of your inquiry and to deliver our reply.
          Resend operates under a GDPR-compliant Data Processing Agreement.
        </li>
        <li>
          <strong>Neon</strong> — cloud database hosting where contact submissions are stored.
          Neon operates under a GDPR-compliant Data Processing Agreement.
        </li>
      </ul>
      <p>
        Both providers are contractually prohibited from using your data for their own purposes.
      </p>

      <h2>6. Your rights under GDPR</h2>
      <p>You have the following rights regarding your personal data:</p>
      <ul>
        <li><strong>Right of access</strong> — to obtain a copy of the data we hold about you.</li>
        <li><strong>Right to rectification</strong> — to correct inaccurate or incomplete data.</li>
        <li>
          <strong>Right to erasure</strong> (&ldquo;right to be forgotten&rdquo;) — to request
          deletion of your data.
        </li>
        <li>
          <strong>Right to restriction</strong> — to limit how we process your data in certain
          circumstances.
        </li>
        <li>
          <strong>Right to object</strong> — to object to processing based on our legitimate
          interest.
        </li>
        <li>
          <strong>Right to lodge a complaint</strong> — with the supervisory authority (see
          Section 8).
        </li>
      </ul>
      <p>
        To exercise any of these rights, please contact us at:{" "}
        <a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a>. We will respond within 30 days.
      </p>

      <h2>7. Cookies</h2>
      <p>
        This website uses only <strong>strictly necessary cookies</strong>. No consent is required
        under the ePrivacy Directive for these categories:
      </p>
      <ul>
        <li>
          <strong>Session cookie</strong> (<code>next-auth.session-token</code>) — required for
          admin account functionality. Not set for regular site visitors.
        </li>
        <li>
          <strong>Language preference</strong> (<code>NEXT_LOCALE</code>) — stores your chosen
          language (Bulgarian or English) for the duration of your browsing session and across
          return visits.
        </li>
        <li>
          <strong>Cookie notice</strong> (<code>cookie-notice-dismissed</code>) — stored in your
          browser&apos;s <code>localStorage</code> (not a cookie) to remember that you have seen
          our cookie notice.
        </li>
      </ul>
      <p>
        We do not use analytics cookies, advertising cookies, tracking pixels, or any
        third-party cookies.
      </p>

      <h2>8. Supervisory authority</h2>
      <p>
        If you believe your personal data has been processed unlawfully, you have the right to
        lodge a complaint with the Bulgarian supervisory authority:
      </p>
      <address className="not-italic bg-[var(--navy-light)] rounded-xl p-4 text-sm">
        <strong>Commission for Personal Data Protection (КЗЛД)</strong>
        <br />
        2 Prof. Tsvetan Lazarov Blvd., Sofia 1592, Bulgaria
        <br />
        Website:{" "}
        <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer">
          www.cpdp.bg
        </a>
      </address>

      <h2>9. Contact</h2>
      <p>
        For any privacy-related requests or questions, please contact us at:{" "}
        <a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a>
        <br />
        {SCHOOL.name}, {SCHOOL.address}
      </p>
    </div>
  );
}

// ── Bulgarian content ─────────────────────────────────────────────────────────

function PrivacyBg() {
  return (
    <div className="prose prose-lg max-w-none text-[var(--text-body)]">
      <p className="text-sm text-[var(--text-muted)]">Последна актуализация: юни 2026</p>

      <h2>1. Кои сме ние</h2>
      <p>
        <strong>{SCHOOL.name}</strong> (&bdquo;ние&rdquo;, &bdquo;нас&rdquo;, &bdquo;наш&rdquo;)
        е Cambridge-сертифицирано езиково училище по английски, намиращо се на адрес{" "}
        {SCHOOL.address}. Ние се ангажираме да защитаваме вашите лични данни в съответствие с
        Регламент (ЕС) 2016/679 (Общ регламент за защита на данните, &bdquo;ОРЗД&rdquo;).
      </p>

      <h2>2. Какви данни събираме и защо</h2>
      <p>Събираме лични данни само когато използвате нашия формуляр за контакт:</p>
      <ul>
        <li>
          <strong>Две имена и имейл адрес</strong> — за да отговорим на вашето запитване.
        </li>
        <li>
          <strong>Телефонен номер</strong> (по избор) — ако желаете да ви се обадим.
        </li>
        <li>
          <strong>Текст на съобщението</strong> — детайлите на вашето запитване.
        </li>
        <li>
          <strong>IP адрес</strong> — записан автоматично за сигурност и предотвратяване на спам.
        </li>
      </ul>
      <p>
        Не събираме никакви други лични данни. Не проследяваме посетителите на сайта.
      </p>

      <h2>3. Правно основание за обработка</h2>
      <p>
        Обработваме данните от вашия формуляр за контакт въз основа на{" "}
        <strong>легитимен интерес</strong> (чл. 6, ал. 1, буква &bdquo;е&rdquo; от ОРЗД) —
        конкретно, за да отговорим на изпратените до нас запитвания. Имате право да възразите
        срещу тази обработка по всяко време (вж. раздел 6).
      </p>

      <h2>4. За колко дълго съхраняваме данните ви</h2>
      <p>
        Запитванията чрез контактния формуляр се съхраняват до <strong>12 месеца</strong> след
        приключване на запитването, след което се изтриват окончателно.
      </p>

      <h2>5. С кого споделяме данните ви</h2>
      <p>
        Не продаваме и не споделяме вашите лични данни с трети страни за маркетингови цели.
        Използваме двама доставчика на услуги, които обработват данни от наше име:
      </p>
      <ul>
        <li>
          <strong>Resend</strong> — доставка на транзакционни имейли. Вашите имена и имейл адрес
          се използват единствено за изпращане на потвърждение за запитването ви и за доставяне
          на нашия отговор. Resend работи по ОРЗД-съвместим договор за обработка на данни.
        </li>
        <li>
          <strong>Neon</strong> — хостинг на база данни, в която се съхраняват запитванията.
          Neon работи по ОРЗД-съвместим договор за обработка на данни.
        </li>
      </ul>
      <p>
        И двамата доставчици са задължени по договор да не използват вашите данни за свои цели.
      </p>

      <h2>6. Вашите права съгласно ОРЗД</h2>
      <p>Имате следните права по отношение на вашите лични данни:</p>
      <ul>
        <li>
          <strong>Право на достъп</strong> — да получите копие от данните, които съхраняваме за
          вас.
        </li>
        <li>
          <strong>Право на коригиране</strong> — да поискате поправка на неточни или непълни
          данни.
        </li>
        <li>
          <strong>Право на изтриване</strong> (&bdquo;правото да бъдете забравен&rdquo;) — да
          поискате изтриване на данните ви.
        </li>
        <li>
          <strong>Право на ограничаване</strong> — да ограничите начина, по който обработваме
          данните ви при определени обстоятелства.
        </li>
        <li>
          <strong>Право на възражение</strong> — да възразите срещу обработка, основана на
          нашия легитимен интерес.
        </li>
        <li>
          <strong>Право на жалба</strong> — до надзорния орган (вж. раздел 8).
        </li>
      </ul>
      <p>
        За упражняване на тези права, моля, свържете се с нас на:{" "}
        <a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a>. Ще отговорим в срок от 30 дни.
      </p>

      <h2>7. Бисквитки (Cookies)</h2>
      <p>
        Уебсайтът използва само <strong>необходими бисквитки</strong>. Съгласие не е необходимо
        съгласно Директивата за поверителност на електронните съобщения за тези категории:
      </p>
      <ul>
        <li>
          <strong>Сесийна бисквитка</strong> (<code>next-auth.session-token</code>) — необходима
          за административни функции. Не се задава при обикновени посетители на сайта.
        </li>
        <li>
          <strong>Езикови предпочитания</strong> (<code>NEXT_LOCALE</code>) — съхранява
          избрания от вас език (български или английски) по време на сесията и при следващи
          посещения.
        </li>
        <li>
          <strong>Известие за бисквитки</strong> (<code>cookie-notice-dismissed</code>) —
          съхранява се в <code>localStorage</code> на браузъра ви (не е бисквитка), за да
          запомни, че сте видели нашето известие за бисквитки.
        </li>
      </ul>
      <p>
        Не използваме аналитични бисквитки, рекламни бисквитки, проследяващи пиксели или
        каквито и да е бисквитки на трети страни.
      </p>

      <h2>8. Надзорен орган</h2>
      <p>
        Ако смятате, че личните ви данни са обработени незаконосъобразно, имате право да
        подадете жалба до надзорния орган в България:
      </p>
      <address className="not-italic bg-[var(--navy-light)] rounded-xl p-4 text-sm">
        <strong>Комисия за защита на личните данни (КЗЛД)</strong>
        <br />
        гр. София 1592, бул. &bdquo;Проф. Цветан Лазаров&rdquo; № 2
        <br />
        Уебсайт:{" "}
        <a href="https://www.cpdp.bg" target="_blank" rel="noopener noreferrer">
          www.cpdp.bg
        </a>
      </address>

      <h2>9. Контакт</h2>
      <p>
        За въпроси или искания, свързани с поверителността, моля, свържете се с нас на:{" "}
        <a href={`mailto:${SCHOOL.email}`}>{SCHOOL.email}</a>
        <br />
        {SCHOOL.name}, {SCHOOL.address}
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = await getTranslations("privacy");

  return (
    <>
      <section className="bg-[var(--navy-deep)] text-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-fraunces text-3xl sm:text-4xl font-semibold text-white">
            {t("title")}
          </h1>
          <p className="mt-3 text-[var(--navy-light)]/80">{t("description")}</p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--white)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {locale === "bg" ? <PrivacyBg /> : <PrivacyEn />}
        </div>
      </section>
    </>
  );
}
