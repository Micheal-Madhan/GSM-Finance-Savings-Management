CREATE OR REPLACE FUNCTION public.create_khss_scheme(
  p_customer_name text,
  p_phone_number bigint,
  p_address text,
  p_total_amount numeric,
  p_number_of_schemes integer,
  p_created_by text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  next_number bigint;
  generated_id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('scheme-id:KHSS', 0));

  SELECT COALESCE(MAX(substring("KHSS_ID" FROM '^GSM-KHSS-([0-9]+)$')::bigint), 0) + 1
  INTO next_number
  FROM public."KolliHills_Scheme_Table"
  WHERE "KHSS_ID" ~ '^GSM-KHSS-[0-9]+$';

  generated_id := 'GSM-KHSS-' || lpad(next_number::text, greatest(3, length(next_number::text)), '0');

  INSERT INTO public."KolliHills_Scheme_Table" (
    "KHSS_ID",
    "CustomerName",
    "PhoneNumber",
    "Address",
    "TotalAmount",
    "NumberOfSchemes",
    "CreatedDate",
    "CreatedBy"
  ) VALUES (
    generated_id,
    p_customer_name,
    p_phone_number,
    p_address,
    p_total_amount,
    p_number_of_schemes,
    now(),
    p_created_by
  );

  RETURN generated_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_dss_scheme(
  p_customer_name text,
  p_phone_number bigint,
  p_address text,
  p_total_amount numeric,
  p_number_of_schemes integer,
  p_item_selection text,
  p_created_by text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  next_number bigint;
  generated_id text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('scheme-id:DSS', 0));

  SELECT COALESCE(MAX(substring("DSS_ID" FROM '^GSM-DSS-([0-9]+)$')::bigint), 0) + 1
  INTO next_number
  FROM public."Diwali_Scheme_Table"
  WHERE "DSS_ID" ~ '^GSM-DSS-[0-9]+$';

  generated_id := 'GSM-DSS-' || lpad(next_number::text, greatest(3, length(next_number::text)), '0');

  INSERT INTO public."Diwali_Scheme_Table" (
    "DSS_ID",
    "CustomerName",
    "PhoneNumber",
    "Address",
    "TotalAmount",
    "NumberOfSchemes",
    "ItemSelection",
    "CreatedAt",
    "CreatedDate",
    "CreatedBy"
  ) VALUES (
    generated_id,
    p_customer_name,
    p_phone_number,
    p_address,
    p_total_amount,
    p_number_of_schemes,
    p_item_selection,
    now(),
    now(),
    p_created_by
  );

  RETURN generated_id;
END;
$$;
  NOTIFY pgrst, 'reload schema';