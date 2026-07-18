import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conocé cómo Anteiku recopila, usa y protege tu información personal.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString("es-AR")}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Información que recopilamos</h2>
            <p className="text-muted-foreground">
              Recopilamos información que usted nos proporciona directamente al
              registrarse, realizar una compra o comunicarse con nosotros. Esto
              puede incluir:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Nombre y apellido
              </li>
              <li>
                Correo electrónico
              </li>
              <li>
                Dirección de envío y facturación
              </li>
              <li>
                Información de pago (procesada de forma segura a través de
                MercadoPago)
              </li>
              <li>
                Historial de pedidos y preferencias
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Uso de la información</h2>
            <p className="text-muted-foreground">
              Utilizamos su información para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Procesar y enviar sus pedidos
              </li>
              <li>
                Gestionar su cuenta y proporcionar soporte al cliente
              </li>
              <li>
                Enviar comunicaciones relacionadas con sus pedidos (confirmaciones,
                envíos, etc.)
              </li>
              <li>
                Mejorar nuestros productos y servicios
              </li>
              <li>
                Cumplir con obligaciones legales
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Cookies y tecnologías similares</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies y tecnologías similares para mejorar su
              experiencia, recordar sus preferencias y analizar el tráfico del
              sitio. Puede configurar su navegador para rechazar cookies, aunque
              esto podría afectar la funcionalidad del sitio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Servicios de terceros</h2>
            <p className="text-muted-foreground">
              Trabajamos con servicios de terceros confiables para operar
              nuestro negocio:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Supabase:</strong> Base de datos y autenticación de
                usuarios.
              </li>
              <li>
                <strong>Auth.js:</strong> Gestión de sesiones y autenticación.
              </li>
              <li>
                <strong>MercadoPago:</strong> Procesamiento de pagos (próximamente).
              </li>
              <li>
                <strong>Vercel:</strong> Alojamiento y despliegue del sitio.
              </li>
            </ul>
            <p className="text-muted-foreground">
              Estos servicios tienen acceso limitado a su información solo para
              realizar las funciones solicitadas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Sus derechos</h2>
            <p className="text-muted-foreground">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Acceder a su información personal
              </li>
              <li>
                Solicitar la corrección de datos inexactos
              </li>
              <li>
                Solicitar la eliminación de su información
              </li>
              <li>
                Oponerse al procesamiento de sus datos
              </li>
              <li>
                Solicitar la portabilidad de sus datos
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Seguridad</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger su información contra acceso no autorizado, alteración,
              divulgación o destrucción. Sin embargo, ningún método de
              transmisión por Internet o almacenamiento electrónico es 100%
              seguro.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Cambios en esta política</h2>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de actualizar esta política de privacidad
              en cualquier momento. Los cambios serán publicados en esta página con
              la fecha de última actualización.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene preguntas sobre esta política de privacidad o sobre el
              tratamiento de su información personal, puede contactarnos a
              través de:
            </p>
            <p className="text-muted-foreground">
              Correo electrónico:{" "}
              <a
                href="mailto:antieku.store@gmail.com"
                className="text-foreground underline"
              >
                antieku.store@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}