-- CreateTable
CREATE TABLE "metodos_pago_cobro" (
    "id" TEXT NOT NULL,
    "cobro_id" TEXT NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metodos_pago_cobro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "metodos_pago_cobro" ADD CONSTRAINT "metodos_pago_cobro_cobro_id_fkey" FOREIGN KEY ("cobro_id") REFERENCES "cobros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
