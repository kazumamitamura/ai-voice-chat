import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 公開ルート: ログイン・サインアップ
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/tutor/login") ||
    request.nextUrl.pathname.startsWith("/tutor/signup");

  // 保護対象: /tutor 配下で認証ページ以外すべて
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/tutor") && !isAuthRoute;

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/tutor/login";
    return NextResponse.redirect(url);
  }

  // ログイン済みで認証ページにアクセスした場合はチャットへ
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/tutor";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
