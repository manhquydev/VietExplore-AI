import AiPlanner from '@/components/ai-planner';
import DestinationGrid from '@/components/destination-grid';
import Header from '@/components/header';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <section
          id="hero"
          className="text-center mb-12 md:mb-20"
          aria-labelledby="hero-title"
        >
          <h1
            id="hero-title"
            className="font-headline text-4xl md:text-6xl font-bold mb-4 text-primary"
          >
            Khám Phá Việt Nam
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-foreground/80">
            Công cụ lập kế hoạch chuyến đi được hỗ trợ bởi AI của chúng tôi sẽ giúp bạn tạo ra một lịch trình hoàn hảo.
          </p>
        </section>

        <AiPlanner />

        <Separator className="my-12 md:my-20 bg-primary/20" />

        <section id="destinations" aria-labelledby="destinations-title">
          <h2
            id="destinations-title"
            className="font-headline text-3xl md:text-4xl font-bold mb-8 text-center"
          >
            Điểm đến nổi bật
          </h2>
          <DestinationGrid />
        </section>
      </main>
      <footer
        className="py-6 text-center text-sm text-muted-foreground"
        aria-label="Footer"
      >
        © {new Date().getFullYear()} VietExplore AI. All rights reserved.
      </footer>
    </div>
  );
}
