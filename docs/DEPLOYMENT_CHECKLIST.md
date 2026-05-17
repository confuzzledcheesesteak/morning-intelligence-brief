# Deployment Checklist

- [ ] `npm install`
- [ ] `npm run build`
- [ ] Create Supabase project and run `supabase/schema.sql`
- [ ] Add Netlify environment variables from `.env.example`
- [ ] Connect GitHub repository to Netlify
- [ ] Verify build command is `npm run build`
- [ ] Verify publish directory is `dist`
- [ ] Verify functions directory is `netlify/functions`
- [ ] Trigger production deploy
- [ ] Test `/api/generate-brief`
- [ ] Test email subscription form
- [ ] Trigger scheduled function manually in Netlify dashboard
- [ ] Add custom domain if desired
