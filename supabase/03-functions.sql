-- ============================================================
-- PART 3/4 — RPC Function: create_order
-- Run this third in Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_order(
  p_user_id        UUID,
  p_guest_email    TEXT,
  p_guest_name     TEXT,
  p_items          JSONB,
  p_shipping_addr  JSONB,
  p_payment_method TEXT DEFAULT 'card',
  p_notes          TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_subtotal   DECIMAL(10,2) := 0;
  v_shipping   DECIMAL(10,2) := 0;
  v_tax        DECIMAL(10,2) := 0;
  v_total      DECIMAL(10,2) := 0;
  v_order_id   BIGINT;
  v_order_num  TEXT;
  v_item       JSONB;
  v_product    public.products%ROWTYPE;
  v_qty        INTEGER;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INTEGER;
    SELECT * INTO v_product
      FROM public.products
     WHERE slug = (v_item->>'slug') OR id = (v_item->>'id')::BIGINT;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'name';
    END IF;
    IF NOT v_product.in_stock OR v_product.stock_count < v_qty THEN
      RAISE EXCEPTION 'Product "%" is out of stock', v_product.name;
    END IF;
    v_subtotal := v_subtotal + v_product.price * v_qty;
  END LOOP;

  v_shipping := CASE WHEN v_subtotal >= 250 THEN 0 ELSE 15 END;
  v_tax      := ROUND(v_subtotal * 0.08, 2);
  v_total    := v_subtotal + v_shipping + v_tax;

  v_order_num := 'HLG-' || to_char(NOW(), 'YYYYMMDD') || '-' || lpad((random()*9999)::INTEGER::TEXT, 4, '0');

  INSERT INTO public.orders (
    order_number, user_id, guest_email, guest_name,
    subtotal, shipping, tax, total,
    shipping_address, payment_method, notes
  ) VALUES (
    v_order_num, p_user_id, p_guest_email, p_guest_name,
    v_subtotal, v_shipping, v_tax, v_total,
    p_shipping_addr, p_payment_method, p_notes
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INTEGER;
    SELECT * INTO v_product
      FROM public.products
     WHERE slug = (v_item->>'slug') OR id = (v_item->>'id')::BIGINT;

    INSERT INTO public.order_items (order_id, product_id, product_name, product_slug, price, quantity, engraving)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.slug, v_product.price, v_qty,
            NULLIF(v_item->>'engraving', ''));

    UPDATE public.products
       SET stock_count = stock_count - v_qty,
           in_stock    = (stock_count - v_qty) > 0
     WHERE id = v_product.id;
  END LOOP;

  RETURN jsonb_build_object(
    'id',           v_order_id,
    'order_number', v_order_num,
    'total',        v_total,
    'subtotal',     v_subtotal,
    'shipping',     v_shipping,
    'tax',          v_tax
  );
END;
$$;
