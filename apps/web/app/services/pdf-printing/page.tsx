'use client';

import DynamicServicePage from '../[categorySlug]/page';

export default function PDFPrintingPage() {
    // Reuse the dynamic service page logic, forcing the slug to 'pdf-printing'
    const params = Promise.resolve({ categorySlug: 'pdf-printing' as string });
    return <DynamicServicePage params={params} />;
}
