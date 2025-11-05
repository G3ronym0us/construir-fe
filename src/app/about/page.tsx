
import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">{t("title")}</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">{t("missionTitle")}</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("missionText")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">{t("visionTitle")}</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("visionText")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">{t("companyTitle")}</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {t("companyText")}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">{t("testimonialsTitle")}</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-700 italic">{t("testimonial1Text")}</p>
              <p className="text-right font-medium text-gray-800 mt-2">- {t("testimonial1Author")}</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-700 italic">{t("testimonial2Text")}</p>
              <p className="text-right font-medium text-gray-800 mt-2">- {t("testimonial2Author")}</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-700 italic">{t("testimonial3Text")}</p>
              <p className="text-right font-medium text-gray-800 mt-2">- {t("testimonial3Author")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
