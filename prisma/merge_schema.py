#!/usr/bin/env python3
"""
Merge schema fragments back into one schema.prisma.
Usage: python3 merge_schema.py ecommerce seo forms
       (core is always included automatically)

Handles injections for ANY model, not just tenant/user: each fragment
may carry "// INJECT_INTO:<model>" blocks that only get spliced back
in if that fragment's module is one of the ones you selected. If the
owner model itself isn't present (its module wasn't selected), the
injection is safely skipped.
"""
import sys, os, re

FRAGMENTS_DIR = "prisma/schema-output/fragments"
OUTPUT_PATH = "prisma/schema.prisma"

RELATION_RESTORES = {
    "analyticsSettings": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "AICrawlSettings": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "AICrawlContent": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "CustomerAddress": ["user user @relation(fields: [userId], references: [id], onDelete: Cascade)"],
    "Subscription": ["user user @relation(fields: [userId], references: [id], onDelete: Cascade)"],
    "PlanSubscription": ["user user @relation(fields: [userId], references: [id], onDelete: Cascade)"],
    "PlanEnrollment": ["user user @relation(fields: [userId], references: [id], onDelete: Cascade)"],
    "Payment": ["user user @relation(fields: [userId], references: [id], onDelete: Cascade)"],
    "comment": [
        "post post @relation(fields: [postId], references: [id], onDelete: Cascade)",
        "user user? @relation(fields: [userId], references: [id])",
    ],
    "Brand": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "ProductCategory": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "Product": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "Attribute": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "Order": [
        "tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)",
        "user user @relation(fields: [userId], references: [id])",
    ],
    "Cart": [
        "user user? @relation(fields: [userId], references: [id], onDelete: Cascade)",
        "tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)",
    ],
    "Coupon": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "ShippingZone": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "TaxClass": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "EcommerceSettings": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "Plan": ["tenant tenant @relation(fields: [tenantId], references: [id])"],
    "PlanSettings": ["tenant tenant @relation(fields: [tenantId], references: [id])"],
    "pricingPageSettings": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "BreadcrumbSettings": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "Redirect": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "NotFoundLog": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "RedirectImport": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "InternalLinkRule": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "FileCategory": ["tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)"],
    "UploadedFile": [
        "tenant tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)",
        "uploader user @relation(fields: [uploadedBy], references: [id])",
    ],
    "FileShareLink": ["creator user @relation(fields: [createdBy], references: [id])"],
}

def restore_relations(text, available_models):
    for model, relations in RELATION_RESTORES.items():
        if not re.search(rf"^model {re.escape(model)} \{{", text, re.M):
            continue
        present = re.search(rf"model {re.escape(model)} \{{(.*?)\n\}}", text, re.S).group(1)
        additions = []
        for relation in relations:
            target = relation.split()[1].rstrip("?")
            field = relation.split()[0]
            if target in available_models and not re.search(rf"^\s*{re.escape(field)}\s", present, re.M):
                additions.append("  " + relation)
        if additions:
            block = re.compile(rf"(model {re.escape(model)} \{{.*?)(\n\}})", re.S)
            text = block.sub(lambda match: match.group(1) + "\n" + "\n".join(additions) + match.group(2), text, count=1)
    return text

def main():
    selected = sys.argv[1:]
    core_path = os.path.join(FRAGMENTS_DIR, "schema.core.prisma")
    core = open(core_path, encoding="utf-8").read()

    module_bodies = []
    all_injections = []  # (owner_model, line_text)

    for mod in selected:
        path = os.path.join(FRAGMENTS_DIR, f"schema.{mod}.prisma")
        if not os.path.exists(path):
            print(f"WARNING: no fragment for module '{mod}', skipping")
            continue
        text = open(path, encoding="utf-8").read()

        # Pull out every INJECT_INTO block, regardless of target model name
        pat = re.compile(r"// INJECT_INTO:(\w+)\n(.*?)\n// END_INJECT:\1\n?", re.S)
        for m in pat.finditer(text):
            all_injections.append((m.group(1), m.group(2)))
        text = pat.sub("", text)
        text = text.replace(
            "// ---- Fields requiring this module, to be spliced back into their owner model at merge time ----\n", "")
        module_bodies.append(text.strip() + "\n")

    merged = core + "\n\n" + "\n".join(module_bodies)
    available_models = set(re.findall(r"^model (\w+) \{", merged, re.M))
    merged = restore_relations(merged, available_models)

    # Now splice injections into their owner model, wherever that model
    # currently lives (core or one of the selected module bodies). If the
    # owner model isn't present in the merged text, skip silently.
    for owner_model, line in all_injections:
        pattern = re.compile(
            rf"(model {re.escape(owner_model)} \{{.*?)(\n\}})", re.S)
        if pattern.search(merged):
            merged = pattern.sub(lambda m: m.group(1) + "\n" + line + m.group(2), merged, count=1)
        # else: owner model's module wasn't selected -> nothing to splice into, skip

    os.makedirs(os.path.dirname(OUTPUT_PATH) or ".", exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(merged)
    print(f"Wrote {OUTPUT_PATH} with modules: core + {', '.join(selected) if selected else '(none)'}")
    print("Now run: npx prisma validate")

if __name__ == "__main__":
    main()
