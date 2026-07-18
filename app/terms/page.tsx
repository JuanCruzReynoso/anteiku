import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Conocé los términos y condiciones de uso y compra en Anteiku.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
            Términos y Condiciones
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString("es-AR")}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Aceptación de los términos</h2>
            <p className="text-muted-foreground">
              Al acceder y utilizar el sitio web de Anteiku, usted acepta estos
              términos y condiciones en su totalidad. Si no está de acuerdo con
              alguno de estos términos, no utilice nuestro sitio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Productos y servicios</h2>
            <p className="text-muted-foreground">
              Nos esforzamos por mostrar los colores y características de
              nuestros productos con la mayor precisión posible. Sin embargo, las
              imágenes son referenciales y pueden diferir ligeramente del
              producto final. Nos reservamos el derecho de modificar o
              descontinuar productos sin previo aviso.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Precios y pagos</h2>
            <p className="text-muted-foreground">
              Todos los precios están expresados en pesos argentinos (ARS) e
              incluyen IVA salvo que se indique lo contrario. Los precios pueden
              cambiar sin previo aviso. El pago se realiza a través de
              MercadoPago y está sujeto a sus términos y condiciones.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Pedidos y confirmación</h2>
            <p className="text-muted-foreground">
              Al realizar un pedido, usted ofrece comprar un producto sujeto a
              disponibilidad. Nos reservamos el derecho de rechazar o cancelar
              pedidos por cualquier motivo, incluyendo errores en precios o
              disponibilidad de stock. Recibirá un correo electrónico de
              confirmación cuando su pedido sea procesado.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Envíos</h2>
            <p className="text-muted-foreground">
              Realizamos envíos a todo el país. Los tiempos de entrega son
              estimados y pueden variar según la ubicación y disponibilidad de
              stock. El costo de envío se calcula al momento de la compra y se
              muestra antes de confirmar el pedido. El envío es gratuito para
              compras superiores al monto indicado en nuestro sitio.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Devoluciones y reembolsos</h2>
            <p className="text-muted-foreground">
              Si no está satisfecho con su compra, puede solicitar una
              devolución dentro de los 30 días posteriores a la recepción del
              pedido. El producto debe estar sin usar, en su empaque original y
              con todos los accesorios. Los reembolsos se procesan a través del
              mismo método de pago utilizado en la compra.
            </p>
            <p className="text-muted-foreground">
              Para iniciar una devolución, contáctenos a través de nuestro
              correo electrónico con el número de pedido y el motivo de la
              devolución.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Limitación de responsabilidad</h2>
            <p className="text-muted-foreground">
              Anteiku no será responsable por daños indirectos, incidentales,
              especiales o consecuentes que surjan del uso de nuestros productos
              o servicios. Nuestra responsabilidad total no excederá el monto
              pagado por el producto o servicio en cuestión.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Propiedad intelectual</h2>
            <p className="text-muted-foreground">
              Todo el contenido del sitio, incluyendo imágenes, textos,
              diseños, marcas y logotipos, es propiedad de Anteiku o de sus
              licenciantes y está protegido por las leyes de propiedad
              intelectual. No se permite su reproducción sin autorización.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Cambios en los términos</h2>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de modificar estos términos y
              condiciones en cualquier momento. Los cambios serán efectivos
              desde su publicación en el sitio. El uso continuado del sitio
              después de los cambios constituye la aceptación de los nuevos
              términos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Contacto</h2>
            <p className="text-muted-foreground">
              Si tiene preguntas sobre estos términos y condiciones, puede
              contactarnos a través de:
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