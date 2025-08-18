'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Bot,
  LoaderCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

import { getItinerary } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from './ui/scroll-area';

const formSchema = z.object({
  interests: z.string().min(3, {
    message: 'Interests must be at least 3 characters long.',
  }),
  budget: z.enum(['low', 'medium', 'high']),
  duration: z.coerce
    .number()
    .int()
    .min(1, { message: 'Duration must be at least 1 day.' })
    .max(30, { message: 'Duration cannot exceed 30 days.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiPlanner() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interests: '',
      budget: 'medium',
      duration: 7,
    },
  });

  function onSubmit(values: FormValues) {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const response = await getItinerary(values);
      if (response.error) {
        setError(response.error);
      }
      if (response.data) {
        setResult(response.data);
      }
    });
  }

  return (
    <section id="ai-planner" aria-labelledby="ai-planner-title">
      <Card className="max-w-4xl mx-auto shadow-lg border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <CardTitle id="ai-planner-title" className="font-headline text-2xl md:text-3xl">
              Công cụ Lập kế hoạch Chuyến đi AI
            </CardTitle>
          </div>
          <CardDescription>
            Điền vào các tùy chọn bên dưới để tạo lịch trình du lịch được cá nhân hóa của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sở thích</FormLabel>
                      <FormControl>
                        <Input placeholder="ví dụ: lịch sử, ẩm thực, thiên nhiên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân sách</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn ngân sách" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Thấp</SelectItem>
                          <SelectItem value="medium">Trung bình</SelectItem>
                          <SelectItem value="high">Cao</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian (ngày)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ví dụ: 7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                {isPending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Tạo Lịch trình
                  </>
                )}
              </Button>
            </form>
          </Form>

          {(result || error) && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-headline text-xl font-bold mb-4">
                Lịch trình được đề xuất của bạn
              </h3>
              {error && <p className="text-destructive">{error}</p>}
              {result && (
                <Card className="bg-background">
                  <ScrollArea className="h-72">
                    <CardContent className="p-6">
                      <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">
                        {result}
                      </pre>
                    </CardContent>
                  </ScrollArea>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
