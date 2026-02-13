import { ChatInterface } from '@/components/chat/chat-interface';
import { PERSONAS } from '@/hooks/use-archestra-chat';

export default function ShoppingPage() {
    return (
        <div className="h-full flex flex-col">
            {/* Placeholder content for the main area if any, or just empty if the ChatInterface is the main interaction */}
            <div className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-4">Shopping Assistant</h1>
                <p className="text-gray-500 mb-8">
                    Your AI-powered shopping companion. Ask me to find products, compare prices, or scrape product details.
                </p>
                {/* We could put the ScrapeWidget here if we had data, but usually it's part of the chat stream */}
            </div>
        </div>
    );
}
