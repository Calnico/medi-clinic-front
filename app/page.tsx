import { Clock, MapPin, Phone, Mail, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import Head from "next/head"

export default function MedicalClinicLanding() {
  return (
    <>
    <Head>
      <title>Mediclinic</title>
      <link rel='icon' href='/Icons/app-medica.png' />
    </Head>
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Image
                src="/Icons/app-medica.png" 
                alt="Logo MediClinic"
                width={40}
               height={40}
              className="object-cover"
              />
            </div>
            <span className="text-xl font-bold">MediClinic</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#inicio" className="text-sm font-medium">
              Inicio
            </Link>
            <Link href="#servicios" className="text-sm font-medium">
              Servicios
            </Link>
            <Link href="#contacto" className="text-sm font-medium">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm">+1 (555) 123-4567</span>
            </div>
            <Link href="/login" className="text-sm font-medium">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-medium">
              Registrarse
            </Link>
            <Button asChild>
              <Link href="/login">Pedir Cita</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section id="inicio" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Su salud es nuestra prioridad
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Ofrecemos atención médica de calidad con profesionales altamente calificados. Agende su cita de manera
                  rápida y sencilla.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg">
                    <ChevronRight className="ml-2 h-4 w-4" />
                    <Link href="/login">Pedir Cita</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {[{nombre: "María García",imagen: "/images/maria.jpg"},
                    {nombre: "Andrea López",imagen: "/images/andrea.jpg"},
                    {nombre: "Leonel Pérez",imagen: "/images/leonel.jpg"},
                    {nombre: "Luisa Quiroga",imagen: "/images/luisa.jpg"}].map((test,i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <Image
                          src={test.imagen}
                          alt={test.nombre}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">+500 pacientes satisfechos</span>
                </div>
              </div>
              <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl">
                <Image
                  src="equipo.jpg"
                  alt="Equipo médico"
                  width={600}
                  height={600}
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Nuestros Servicios
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Especialidades Médicas</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Contamos con un equipo de especialistas para atender todas sus necesidades de salud.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Medicina General", image: "/Icons/estetoscopio.png", description: "Control y seguimiento de enfermedades crónicas (hipertensión, diabetes, etc.)" },
                { title: "Pediatría", image: "/Icons/pediatria.png", description: "Diagnóstico y manejo de enfermedades pediátricas" },
                { title: "Ginecología", image: "/Icons/ginecologia.png", description: "Valoración ginecológica de rutina" },
                { title: "Cardiología", image: "/Icons/cardiologia.png", description: "Prevención de enfermedades cardiovasculares" },
                { title: "Dermatología", image: "/Icons/dermatologia.png", description: "Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas" },
                { title: "Oftalmología", image: "/Icons/oftalmologia.png", description: "Detección de errores de refracción (miopía, astigmatismo, hipermetropía)" },
                ].map((service, i) => (
                <Card key={i} className="transition-all hover:shadow-lg">
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="rounded-full p-3 bg-primary/10">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={40}
                        height={40}
                        className="h-10 w-10"
                      />
                    </div>
                    <h3 className="text-xl font-bold">{service.title}</h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Testimonios</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Lo que dicen nuestros pacientes</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Descubra por qué nuestros pacientes confían en nosotros para su atención médica.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
  { nombre: "María García", año: "2020", imagen: "/images/maria.jpg", mensaje: "Excelente atención médica. El personal es muy amable y profesional. 100% recomendado." },
  { nombre: "Andrea López", año: "2021", imagen: "/images/andrea.jpg", mensaje: "Excelente servicio. Me sentí en buenas manos desde el primer momento." },
  { nombre: "Leonel Pérez", año: "2019", imagen: "/images/leonel.jpg", mensaje:"Rápida atención y diagnóstico certero. Muy agradecida." },
].map((testimonio,i) => (
  <Card key={i} className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) =>(
          <Star key={i} className="h-5 w-5 fill-primary text-primary" />
        ))}
      </div>
      <p className="mb-4 italic">{testimonio.mensaje}
        
      </p>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full overflow-hidden">
          <Image
            src={testimonio.imagen}
            alt={`Patient ${testimonio.nombre}`}
            width={40}
            height={40}
            className="h-full w-full object-cover"
            />
            </div>
            <div>
              <h4 className="font-medium">{testimonio.nombre}</h4>
              <p className="text-sm text-muted-foreground">Paciente desde {testimonio.año}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Contacto</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">¿Tiene alguna pregunta?</h2>
                <p className="text-muted-foreground md:text-xl">
                  Estamos aquí para ayudarle. Contáctenos y le responderemos a la brevedad.
                </p>
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full p-1.5 bg-primary/10">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full p-1.5 bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">contacto@mediclinic.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full p-1.5 bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Av. Principal 123, Ciudad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full p-1.5 bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">Lun - Vie: 8:00 - 20:00, Sáb: 9:00 - 14:00</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden h-[400px] w-full">
                <Image
                  src="ubicacion.png"
                  alt="Mapa de ubicación"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0 bg-dark text-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} MediClinic. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Términos y Condiciones
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
