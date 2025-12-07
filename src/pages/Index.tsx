import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Clock, LogOut, User as UserIcon, Mail, Lock, Chrome, AlertCircle, Plus, BarChart3, Trash2, Activity, Timer, TrendingUp, Calendar, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = { apiKey: "YOUR_API_KEY", authDomain: "YOUR_PROJECT_ID.firebaseapp.com", projectId: "YOUR_PROJECT_ID", storageBucket: "YOUR_PROJECT_ID.appspot.com", messagingSenderId: "YOUR_SENDER_ID", appId: "YOUR_APP_ID" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

type Category = 'Work' | 'Study' | 'Sleep' | 'Entertainment' | 'Exercise' | 'Other';
const CATEGORIES: Category[] = ['Work', 'Study', 'Sleep', 'Entertainment', 'Exercise', 'Other'];
const COLORS: Record<Category, string> = { Work: '#FF6384', Study: '#36A2EB', Sleep: '#FFCE56', Entertainment: '#4BC0C0', Exercise: '#9966FF', Other: '#FF9F40' };

interface ActivityData { id: string; name: string; category: Category; duration: number; }

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [activityCategory, setActivityCategory] = useState<Category>('Work');
  const [activityDuration, setActivityDuration] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => { const unsub = onAuthStateChanged(auth, u => { setUser(u); setAuthLoading(false); }); return () => unsub(); }, []);

  useEffect(() => {
    if (!user) { setActivities([]); setActivitiesLoading(false); return; }
    setActivitiesLoading(true);
    const unsub = onSnapshot(doc(db, `users/${user.uid}/days/${dateKey}`), snap => { setActivities(snap.exists() ? snap.data().activities || [] : []); setActivitiesLoading(false); });
    return () => unsub();
  }, [user, dateKey]);

  const handleAuth = async (e: React.FormEvent) => { e.preventDefault(); if (!email.trim() || !password.trim()) { setAuthError('Fill all fields'); return; } if (password.length < 6) { setAuthError('Password: 6+ chars'); return; } setSubmitting(true); setAuthError(null); try { if (isLogin) await signInWithEmailAndPassword(auth, email, password); else await createUserWithEmailAndPassword(auth, email, password); } catch (err) { setAuthError(err instanceof Error ? err.message : 'Auth failed'); } setSubmitting(false); };
  const handleGoogleAuth = async () => { setSubmitting(true); setAuthError(null); try { await signInWithPopup(auth, googleProvider); } catch (err) { setAuthError(err instanceof Error ? err.message : 'Google login failed'); } setSubmitting(false); };

  const addActivity = async () => { if (!user || !activityName.trim()) { toast.error('Enter name'); return; } const dur = parseInt(activityDuration); if (!dur || dur < 1 || dur > 1440) { toast.error('Duration: 1-1440'); return; } const total = activities.reduce((s, a) => s + a.duration, 0); if (total + dur > 1440) { toast.error('Exceeds 24h'); return; } const newAct = { id: `${Date.now()}`, name: activityName.trim(), category: activityCategory, duration: dur }; const updated = [...activities, newAct]; await setDoc(doc(db, `users/${user.uid}/days/${dateKey}`), { activities: updated, totalMinutes: updated.reduce((s, a) => s + a.duration, 0), updatedAt: serverTimestamp() }); setActivityName(''); setActivityDuration(''); toast.success('Added'); };
  const deleteActivity = async (id: string) => { if (!user) return; const updated = activities.filter(a => a.id !== id); await setDoc(doc(db, `users/${user.uid}/days/${dateKey}`), { activities: updated, totalMinutes: updated.reduce((s, a) => s + a.duration, 0), updatedAt: serverTimestamp() }); toast.success('Deleted'); };

  const totalMins = activities.reduce((s, a) => s + a.duration, 0);
  const remaining = 1440 - totalMins;
  const exceeded = totalMins > 1440;
  const fmtTime = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

  const catTotals = useMemo(() => { const t: Record<Category, number> = { Work: 0, Study: 0, Sleep: 0, Entertainment: 0, Exercise: 0, Other: 0 }; activities.forEach(a => t[a.category] += a.duration); return t; }, [activities]);

  if (authLoading) return <div className="min-h-screen gradient-bg flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /></div>;

  if (!user) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md"><div className="text-center mb-8"><div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card/20 mb-4"><Clock className="w-10 h-10 text-primary-foreground" /></div><h1 className="text-3xl font-bold text-primary-foreground">Daily Time Tracker</h1></div>
        <div className="bg-card rounded-2xl p-8 card-shadow"><h2 className="text-2xl font-semibold text-card-foreground mb-6 text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          {authError && <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive"><AlertCircle className="w-4 h-4" /><p className="text-sm">{authError}</p></div>}
          <form onSubmit={handleAuth} className="space-y-4"><div><Label>Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl bg-muted/50" /></div></div><div><Label>Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12 rounded-xl bg-muted/50" /></div></div><Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold">{submitting ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}</Button></form>
          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center"><span className="px-3 bg-card text-muted-foreground text-sm">or</span></div></div>
          <Button variant="outline" onClick={handleGoogleAuth} disabled={submitting} className="w-full h-12 rounded-xl border-2"><Chrome className="w-5 h-5 mr-2 text-primary" />Google</Button>
          <p className="text-center text-muted-foreground mt-6">{isLogin ? "No account? " : "Have account? "}<button onClick={() => { setIsLogin(!isLogin); setAuthError(null); }} className="text-primary font-semibold hover:underline">{isLogin ? 'Sign up' : 'Sign in'}</button></p>
        </div></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="gradient-bg sticky top-0 z-50 shadow-lg"><div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-card/20 flex items-center justify-center"><Clock className="w-5 h-5 text-primary-foreground" /></div><h1 className="text-xl md:text-2xl font-bold text-primary-foreground">Daily Time Tracker</h1></div><div className="flex items-center gap-3"><span className="hidden sm:block text-sm text-primary-foreground/90 bg-card/10 px-3 py-2 rounded-lg">{user.email}</span><Button onClick={() => signOut(auth)} variant="ghost" className="text-primary-foreground hover:bg-card/20 rounded-xl"><LogOut className="w-4 h-4" /></Button></div></div></header>
      <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-card rounded-2xl p-4 card-shadow flex items-center justify-between gap-2"><Button variant="ghost" size="icon" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); setShowAnalytics(false); }} className="rounded-xl"><ChevronLeft className="w-5 h-5" /></Button><Popover><PopoverTrigger asChild><Button variant="outline" className="flex-1 max-w-md h-12 rounded-xl border-2 border-primary/20 gap-2"><CalendarIcon className="w-4 h-4 text-primary" />{format(selectedDate, 'EEEE, MMMM d, yyyy')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 rounded-xl"><CalendarComponent mode="single" selected={selectedDate} onSelect={d => { if (d) { setSelectedDate(d); setShowAnalytics(false); } }} /></PopoverContent></Popover><Button variant="ghost" size="icon" onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); setShowAnalytics(false); }} className="rounded-xl"><ChevronRight className="w-5 h-5" /></Button>{format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && <Button onClick={() => { setSelectedDate(new Date()); setShowAnalytics(false); }} className="rounded-xl gradient-primary text-primary-foreground">Today</Button>}</div>
        <div ref={formRef} className="bg-card rounded-2xl p-6 card-shadow"><h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add Activity</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"><div><Label>Activity Name</Label><Input placeholder="e.g., Workout" value={activityName} onChange={e => setActivityName(e.target.value)} className="h-11 rounded-xl bg-muted/50 mt-1" /></div><div><Label>Category</Label><Select value={activityCategory} onValueChange={v => setActivityCategory(v as Category)}><SelectTrigger className="h-11 rounded-xl bg-muted/50 mt-1"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div><div><Label>Duration (min)</Label><Input type="number" min={1} max={1440} placeholder="60" value={activityDuration} onChange={e => setActivityDuration(e.target.value)} className="h-11 rounded-xl bg-muted/50 mt-1" /></div></div><div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"><div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${exceeded ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{exceeded ? <><AlertCircle className="w-5 h-5" /><span className="font-medium">Exceeded 24h!</span></> : <><Clock className="w-5 h-5" /><span className="font-medium">Remaining: {fmtTime(remaining)}</span></>}</div><div className="flex gap-3"><Button onClick={addActivity} disabled={exceeded} className="flex-1 sm:flex-none h-11 rounded-xl gradient-primary text-primary-foreground font-semibold gap-2"><Plus className="w-4 h-4" />Add</Button><Button onClick={() => setShowAnalytics(true)} disabled={!activities.length || exceeded} variant="outline" className="flex-1 sm:flex-none h-11 rounded-xl border-2 border-primary/30 gap-2"><BarChart3 className="w-4 h-4" />Analyse</Button></div></div></div>
        <div className="bg-card rounded-2xl p-6 card-shadow"><h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />Activities ({activities.length})</h2>{activitiesLoading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div> : activities.length === 0 ? <div className="text-center py-8 text-muted-foreground">No activities yet</div> : <div className="space-y-3 max-h-[400px] overflow-y-auto">{activities.map(a => <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"><div className="flex items-center gap-4"><div className="w-3 h-12 rounded-full" style={{ backgroundColor: COLORS[a.category] }} /><div><h3 className="font-medium text-card-foreground">{a.name}</h3><div className="flex items-center gap-2 mt-1"><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${COLORS[a.category]}20`, color: COLORS[a.category] }}>{a.category}</span><span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(a.duration)}</span></div></div></div><Button variant="ghost" size="icon" onClick={() => deleteActivity(a.id)} className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-xl"><Trash2 className="w-4 h-4" /></Button></div>)}</div>}</div>
        {showAnalytics && (activities.length > 0 ? <div className="bg-card rounded-2xl p-6 card-shadow"><h2 className="text-xl font-semibold text-card-foreground mb-6 flex items-center gap-2"><Timer className="w-5 h-5 text-primary" />Analytics</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"><div className="bg-primary/10 text-primary rounded-xl p-4 flex items-center gap-3"><Clock className="w-6 h-6" /><div><p className="text-sm opacity-80">Total</p><p className="text-xl font-bold">{fmtTime(totalMins)}</p></div></div><div className="bg-secondary/10 text-secondary rounded-xl p-4 flex items-center gap-3"><Activity className="w-6 h-6" /><div><p className="text-sm opacity-80">Count</p><p className="text-xl font-bold">{activities.length}</p></div></div><div className="bg-accent/10 text-accent rounded-xl p-4 flex items-center gap-3"><TrendingUp className="w-6 h-6" /><div><p className="text-sm opacity-80">Top</p><p className="text-xl font-bold">{CATEGORIES.reduce((a, b) => catTotals[a] > catTotals[b] ? a : b)}</p></div></div></div><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">{CATEGORIES.map(c => <div key={c} className="rounded-xl p-3 text-center" style={{ backgroundColor: `${COLORS[c]}15` }}><div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: COLORS[c] }} /><p className="text-xs text-muted-foreground">{c}</p><p className="font-semibold text-card-foreground">{fmtTime(catTotals[c])}</p></div>)}</div></div> : <div className="bg-card rounded-2xl p-12 card-shadow text-center"><div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6"><Calendar className="w-12 h-12 text-primary" /></div><h3 className="text-2xl font-bold text-card-foreground mb-2">No data for this date</h3><p className="text-muted-foreground mb-8">Start logging now</p><Button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })} className="h-12 px-8 rounded-xl gradient-primary text-primary-foreground font-semibold gap-2"><Plus className="w-5 h-5" />Start</Button></div>)}
      </main>
      <footer className="text-center py-6 text-muted-foreground text-sm">Daily Time Tracker</footer>
    </div>
  );
};

export default Index;
