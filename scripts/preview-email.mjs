import { getEmailTemplates } from "../src/app/lib/email-template.js";

(async () => {
  try {
    const sample = {
      sharedWith: "test@example.com",
      fileCount: 1,
      fileTitles: ["Report.pdf"],
      title: "Report.pdf",
      category: "Reports",
      message: "testing",
      link: "https://example.com/shared/abc",
      password: "SHR-ABC123",
      senderName: "Alice",
    };

    const templates = await getEmailTemplates("FILE_SHARED", sample);
    if (!templates || !templates.length) {
      console.error("No templates returned");
      process.exit(1);
    }

    console.log(templates[0].html);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
