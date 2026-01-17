// services/automationService.client.ts - TypeScript clean, browser-safe
export interface Job {
    title: string;
    company: string;
    applicationUrl?: string;
}

export const openSafeApplicationUrl = async (job: Job, explicitUrl?: string): Promise<void> => {
    const title = job.title;
    const company = job.company;

    const searchQuery = `${title} ${company} careers apply`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    let url = explicitUrl;
    if (!url && job.applicationUrl) {
        url = job.applicationUrl;
    }
    if (!url) {
        url = searchUrl;
    }

    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Popups blocked. Please allow popups for this site.');
        return;
    }

    // Self-contained HTML - no external function dependencies
    newWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>Opening Job...</title></head>
    <body style="margin:0;padding:40px;background:#f8fafc;font-family:system-ui;text-align:center;">
      <div style="max-width:400px;margin:0 auto;">
        <h2 style="color:#1e293b;font-size:24px;margin-bottom:16px;">🔄 Opening Application</h2>
        <p style="color:#64748b;font-size:16px;margin-bottom:24px;">Redirecting to ${company}...</p>
        <div style="width:48px;height:48px;border:4px solid #e2e8f0;border-top:4px solid #3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px;"></div>
        <p style="color:#94a3b8;font-size:14px;">If not redirected, <a href="${url}" target="_blank" style="color:#3b82f6;">click here</a></p>
      </div>
      <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
      <script>setTimeout(() => window.location.href='${url}', 1500);</script>
    </body>
    </html>
  `);
};
