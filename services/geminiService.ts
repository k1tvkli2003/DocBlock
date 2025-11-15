import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GroundingSource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AnalysisResult {
  isValid: boolean;
  analysis: string;
}

/**
 * Analyzes the reason for a patient warning using gemini-2.5-pro with thinking mode and Google Search.
 * @param reason - The reason provided by the doctor.
 * @returns An object with validation status and AI's analysis.
 */
export const analyzeWarningReason = async (reason: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `Analyze the following reason for a patient warning and determine if it's a valid and objective threat to medical staff. Reason: "${reason}"`,
        config: {
            systemInstruction: `شما یک متخصص بسیار دقیق و **شکاک** در زمینه اخلاق پزشکی و امنیت کادر درمان هستید. وظیفه شما تحلیل گزارش یک پزشک در مورد بیمار برای ثبت در یک سیستم هشدار است.

**معیارهای تحلیل:**
۱. **کامل بودن گزارش:** آیا گزارش جزئیات کافی را ارائه می‌دهد؟ این **مهم‌ترین** معیار است. باید **حتما** مشخص باشد:
    - **ماجرا چه بوده؟** (شرح دقیق اتفاق)
    - **چرا بیمار این کار را کرد؟** (زمینه و انگیزه احتمالی)
    - **خشونت چگونه ابراز شد؟** (فیزیکی، کلامی، تهدید مستقیم با ذکر کلمات دقیق)
    - **خشونت متوجه چه کسی بود؟** (پزشک، پرستار، منشی)
**حتی خطرناک‌ترین تهدیدها نیز بدون زمینه کامل، قابل قبول نیستند.**

۲. **عینی بودن:** آیا گزارش بر اساس حقایق عینی است؟ تنها تهدید مستقیم، خشونت فیزیکی، رفتار مخل پایدار، یا کلاهبرداری واضح قابل قبول است. اختلافات بر سر کیفیت درمان یا نارضایتی عمومی، دلیل کافی نیست.

۳. **استدلال منطقی:** گزارش را برای تناقضات منطقی و ادعاهای غیرممکن به دقت بررسی کنید. یک ادعا مانند "بیمار به سر من شلیک کرد و من را کشت" از نظر منطقی متناقض است، زیرا یک فرد مرده نمی‌تواند گزارش ثبت کند. در چنین مواردی، گزارش را رد کرده و از کاربر بخواهید که منظور خود را شفاف‌سازی کند (مثلاً "آیا بیمار شما را تهدید به کشتن کرد؟ لطفاً عین کلمات را نقل کنید."). **تحت هیچ شرایطی یک ادعای غیرمنطقی را تأیید نکنید.**

**تحلیل گزارش‌های اصلاحی (مرحله دوم):**
اگر متن ورودی شامل '[توضیحات تکمیلی]:' باشد، این یعنی کاربر در حال اصلاح گزارش اولیه خود است. در این حالت:
۱. **کل متن را در نظر بگیرید:** تحلیل خود را بر اساس **ترکیب گزارش اولیه و توضیحات تکمیلی** انجام دهید.
۲. **از نو ارزیابی کنید:** فرض نکنید که چون کاربر یک بخش را اصلاح کرده، گزارش کامل شده است. **تمام معیارها** (کامل بودن، عینی بودن، منطق) را دوباره بر روی متن **کامل و جدید** اعمال کنید.
۳. **سخت‌گیر بمانید:** اگر کاربر تناقض منطقی را برطرف کرده اما هنوز جزئیات کامل ماجرا (چرا، چگونه، چه کسی) را ارائه نکرده است، گزارش را **همچنان رد کنید** و به طور مشخص بگویید که "از اصلاح شما متشکریم، اما برای تأیید گزارش هنوز به شرح کامل زمینه و جزئیات اتفاق نیاز است." **هرگز یک گزارش ناقص را فقط به دلیل اصلاح شدن یک خطا تأیید نکنید.**

۴. **جستجوی خارجی:** از قابلیت جستجو برای یافتن سوابق عمومی که ادعا را تایید کند استفاده کنید.

**خروجی:**
- پاسخ شما باید **فقط و فقط** یک آبجکت JSON با این ساختار باشد: \`{"isValid": boolean, "analysis": "string"}\`.
- فیلد \`analysis\` باید به **زبان فارسی**، **بسیار خلاصه (حداکثر ۶-۷ خط)** و **مستدل** باشد.
- **اگر گزارش معتبر است (\`isValid: true\`):** دلیل تایید را به طور خلاصه بنویسید.
- **اگر گزارش به دلیل ناکافی بودن جزئیات یا تناقض منطقی رد می‌شود (\`isValid: false\`):** در \`analysis\` به طور مشخص توضیح دهید که **کدام جزئیات باید اضافه شوند یا کدام بخش از گزارش غیرمنطقی است و نیاز به اصلاح دارد.** مثلا: "ادعای 'کشته شدن' شما از نظر منطقی صحیح نیست. لطفاً توضیح دهید که آیا بیمار شما را تهدید به مرگ کرده است و جزئیات دقیق ماجرا را شرح دهید."
- **اگر گزارش به دلیل نامعتبر بودن محتوا رد می‌شود (\`isValid: false\`):** دلیل رد شدن را به وضوح توضیح دهید. مثلا: "این مورد به نظر یک اختلاف نظر در مورد روند درمان است و شامل تهدید مستقیم نمی‌شود."`,
            thinkingConfig: { thinkingBudget: 32768 },
            tools: [{ googleSearch: {} }],
        },
    });

    // Robustly parse the JSON from the model's text response.
    let jsonText = response.text.trim();
    const jsonMatch = jsonText.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[2]) {
        jsonText = jsonMatch[2];
    }
    
    const result: AnalysisResult = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error analyzing warning reason:", error);
    let errorMessage = "در تحلیل دلیل اخطار خطایی رخ داد. لطفاً کنسول را برای جزئیات بررسی کنید.";
    if (error instanceof SyntaxError) {
        errorMessage = "تحلیل هوش مصنوعی ناموفق بود: پاسخ مدل در فرمت مورد انتظار نبود. لطفاً دوباره تلاش کنید.";
    }
    return {
      isValid: false,
      analysis: errorMessage
    };
  }
};


interface PublicInfoResult {
  summary: string;
  sources: GroundingSource[];
}

/**
 * Searches for public information about a patient using gemini-2.5-flash with Google Search grounding.
 * @param patientName - The name of the patient.
 * @param patientId - The national ID of the patient.
 * @returns A summary of findings and a list of sources.
 */
export const searchPublicInfo = async (patientName: string, patientId: string): Promise<PublicInfoResult> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `هرگونه اطلاعات عمومی، گزارش خبری یا سوابق رسمی به زبان فارسی در مورد خشونت، تهدید یا مسائل قانونی بالقوه مربوط به شخصی به نام '${patientName}' با کد ملی '${patientId}' را پیدا کنید. یافته‌های خود را به طور خلاصه جمع‌بندی کنید.`,
            config: {
                systemInstruction: `You are an information retrieval assistant. Your task is to find public records about a specific individual. **Crucially**, if your search yields no specific results about the person in question (name and ID), you MUST respond with the exact Persian phrase: 'هیچ اطلاعات عمومی مرتبطی یافت نشد.'. Do not provide any other summary, explanation, or related information. Your entire response must be that exact phrase.`,
                tools: [{ googleSearch: {} }],
            },
        });
        
        const summary = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return { summary, sources };

    } catch (error) {
        console.error("Error searching public info:", error);
        return {
            summary: "هنگام جستجوی اطلاعات عمومی خطایی رخ داد.",
            sources: []
        };
    }
};

interface WithdrawalAnalysisResult {
  isApproved: boolean;
  analysis: string;
}

/**
 * Analyzes a request to withdraw a warning.
 * @param originalReason - The initial reason for the warning.
 * @param withdrawalReason - The new reason for withdrawing the warning.
 * @returns An object with approval status and AI's analysis.
 */
export const analyzeWithdrawalReason = async (originalReason: string, withdrawalReason: string): Promise<WithdrawalAnalysisResult> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `A doctor wishes to withdraw a previous warning about a patient.
            Original Warning Reason: "${originalReason}"
            Reason for Withdrawal: "${withdrawalReason}"
            
            Analyze both reasons and decide if the withdrawal is justified.`,
            config: {
                systemInstruction: `شما یک متخصص اخلاق پزشکی و امنیت بیمارستان هستید. وظیفه شما این است که مشروعیت درخواست یک پزشک برای پس گرفتن اخطار بیمار را تعیین کنید.
- درخواست پس گرفتن را **تأیید کنید** اگر دلیل آن حاکی از سوءتفاهم، یک مسئله یک‌باره حل‌شده، اتهام دروغین یا یک خطای اداری واضح باشد.
- درخواست را **رد کنید** اگر اخطار اصلی یک تهدید جدی و عینی (مانند خشونت فیزیکی، تهدیدهای معتبر، آزار و اذیت مکرر) را توصیف کرده و دلیل پس گرفتن ضعیف، تحت فشار یا غیرمنطقی به نظر می‌رسد و تهدید اولیه را بی‌اعتبار نمی‌کند. ایمنی کادر درمان اولویت اصلی است.
- یک تحلیل واضح برای تصمیم خود ارائه دهید.
- پاسخ خود را فقط و فقط در قالب یک آبجکت JSON به این شکل برگردانید: {"isApproved": boolean, "analysis": "استدلال دقیق خود را در اینجا به زبان فارسی بنویسید."}`,
                thinkingConfig: { thinkingBudget: 32768 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isApproved: { type: Type.BOOLEAN },
                        analysis: { type: Type.STRING }
                    },
                    required: ['isApproved', 'analysis']
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing withdrawal reason:", error);
        return {
            isApproved: false,
            analysis: "هنگام تحلیل درخواست پس گرفتن اخطار، خطایی رخ داد."
        };
    }
};