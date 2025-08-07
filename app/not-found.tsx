import Footer from '@/components/landing/footer'
import Header from '@/components/landing/header'
import { Empty } from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import { Nunito } from 'next/font/google'
 
// Указываем правильные веса, например, 400 и 700
const nunito = Nunito({
  subsets: ['latin'], // Указываем подмножество латиницы
  weight: ['400'], // Указываем допустимые веса
  display: 'swap', // Для улучшенной загрузки шрифта
});

export default function NotFound() {
  return (
    <main className={cn("bg-[#0f172a] text-[#A1AAC9] overflow-x-hidden h-full flex flex-col justify-between", nunito.className)}>
    <Header/>
      <Empty label="Page not found." />
    <Footer/> 
</main>
  )
}