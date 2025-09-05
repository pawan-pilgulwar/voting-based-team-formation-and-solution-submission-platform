import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Users, 
  MessageSquare, 
  Folder, 
  Settings, 
  BookOpen,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Target,
  Heart
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                🌍 Global Student Platform
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Empower Students to{" "}
                <span className="text-primary">Collaborate Globally</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join thousands of students worldwide in solving real-world challenges, 
                building meaningful projects, and creating lasting connections across borders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 flex items-center justify-center">
                <Globe className="h-32 w-32 text-primary" />
              </div>
              <div className="absolute -top-4 -right-4 bg-background border rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-semibold">10,000+</span>
                  <span className="text-sm text-muted-foreground">Active Students</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-background border rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-semibold">500+</span>
                  <span className="text-sm text-muted-foreground">Challenges</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">Features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Everything You Need to Collaborate Successfully
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and features students need to work together 
              on meaningful projects and real-world challenges.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-8 border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Challenge Management</h3>
              <p className="text-muted-foreground">
                Propose and join real-world challenges. Browse through diverse problem sets 
                and find projects that match your interests and skills.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Global Collaboration</h3>
              <p className="text-muted-foreground">
                Work with students across borders and time zones. Connect with diverse 
                perspectives and build international networks.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Communication</h3>
              <p className="text-muted-foreground">
                Chat instantly with team members, participate in discussion forums, 
                and share resources seamlessly.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Folder className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Project Management</h3>
              <p className="text-muted-foreground">
                Organize tasks, track progress, and manage deadlines with built-in 
                project management tools designed for students.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Learning Hub</h3>
              <p className="text-muted-foreground">
                Access educational resources, tutorials, and best practices to enhance 
                your collaboration and problem-solving skills.
              </p>
            </div>

            <div className="bg-background rounded-xl p-8 border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Admin Tools</h3>
              <p className="text-muted-foreground">
                Comprehensive moderation tools and analytics to ensure a safe, 
                productive environment for all students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge variant="outline">Benefits</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                Why Students Choose Our Platform
              </h2>
              <p className="text-xl text-muted-foreground">
                Join a community that&apos;s transforming how students learn, collaborate,
                and make a real impact on the world.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Build Real-World Skills</h3>
                    <p className="text-muted-foreground">
                      Work on actual problems and develop practical skills that employers value.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Connect Globally</h3>
                    <p className="text-muted-foreground">
                      Meet like-minded students from around the world and build lasting professional relationships.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Make a Difference</h3>
                    <p className="text-muted-foreground">
                      Contribute to solving real-world challenges and create positive impact in your community.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-background rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">95%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="bg-background rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">50+</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                  <div className="bg-background rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                  <div className="bg-background rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">100%</div>
                    <div className="text-sm text-muted-foreground">Free</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">How It Works</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who are already collaborating and making an impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold">Sign Up & Create Profile</h3>
              <p className="text-muted-foreground">
                Create your free account and build a profile showcasing your skills and interests.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold">Browse or Submit Challenges</h3>
              <p className="text-muted-foreground">
                Explore existing challenges or propose new ones that you&apos;re passionate about solving.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold">Join Teams & Collaborate</h3>
              <p className="text-muted-foreground">
                Connect with other students, form teams, and start working together on solutions.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <h3 className="text-xl font-semibold">Deliver & Celebrate</h3>
              <p className="text-muted-foreground">
                Complete your projects, share your solutions, and celebrate your achievements with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              What Students Are Saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from students who have transformed their learning experience through global collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl p-8 border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quots;This platform changed my perspective on learning. Working with students from different countries
                gave me insights I never would have gained in a traditional classroom.&quots;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">SM</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Martinez</div>
                  <div className="text-sm text-muted-foreground">Computer Science, MIT</div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-xl p-8 border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quot;The real-world challenges helped me apply my theoretical knowledge practically.
                I&apos;ve built amazing projects and made lifelong friends from around the world.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">AK</span>
                </div>
                <div>
                  <div className="font-semibold">Ahmed Khan</div>
                  <div className="text-sm text-muted-foreground">Engineering, Stanford</div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-xl p-8 border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6">
                &quot;As someone interested in social impact, this platform connected me with like-minded students
                working on meaningful projects. It&apos;s been an incredible journey of growth and collaboration.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">EJ</span>
                </div>
                <div>
                  <div className="font-semibold">Emma Johnson</div>
                  <div className="text-sm text-muted-foreground">Social Sciences, Oxford</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Start Your Collaboration Journey?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of students who are already making a difference through global collaboration. 
              Your next great project and lifelong friends are waiting for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Join Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Contact Support
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Join 10,000+ students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Start collaborating today</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
