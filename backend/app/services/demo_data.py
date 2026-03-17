"""Seed rich demo data for Lisbon — the launch city."""

from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.tour import Tour, TourStatus, TourTheme, TourDifficulty
from app.models.tour_stop import TourStop
from app.models.review import Review
from app.models.purchase import Purchase, PurchaseStatus
from app.core.security import hash_password


async def seed_demo_data(db: AsyncSession) -> None:
    """Populate the database with Lisbon demo data if empty."""
    result = await db.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return  # Already seeded

    now = datetime.now(timezone.utc)

    # ─── Guides ────────────────────────────────────────
    guides = [
        User(
            email="ana@wandr.demo",
            full_name="Ana Rodrigues",
            hashed_password=hash_password("demo1234"),
            role=UserRole.GUIDE,
            bio="Lisbon-born historian and storyteller. I've been giving walking tours for 8 years and fell in love with sharing my city's hidden layers.",
            city="Lisbon",
            country="Portugal",
            languages='["pt","en","es"]',
            is_verified_local=True,
            guide_tagline="History whispered through cobblestones",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
        ),
        User(
            email="marco@wandr.demo",
            full_name="Marco Silva",
            hashed_password=hash_password("demo1234"),
            role=UserRole.GUIDE,
            bio="Chef turned food guide. After 12 years in Lisbon kitchens, I now take people on culinary adventures through the neighborhoods I grew up in.",
            city="Lisbon",
            country="Portugal",
            languages='["pt","en","fr"]',
            is_verified_local=True,
            guide_tagline="Taste Lisbon like a local",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Marco",
        ),
        User(
            email="sofia@wandr.demo",
            full_name="Sofia Mendes",
            hashed_password=hash_password("demo1234"),
            role=UserRole.GUIDE,
            bio="Street art curator and urban culture enthusiast. I track every new mural, stencil, and paste-up across the city.",
            city="Lisbon",
            country="Portugal",
            languages='["pt","en","de"]',
            is_verified_local=True,
            guide_tagline="The city is the canvas",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
        ),
    ]
    for g in guides:
        db.add(g)
    await db.flush()

    # ─── Tourists (for reviews) ────────────────────────
    tourists = [
        User(email="tourist1@wandr.demo", full_name="James Chen", hashed_password=hash_password("demo1234"), role=UserRole.TOURIST, city="London", country="UK", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=James"),
        User(email="tourist2@wandr.demo", full_name="Marie Dubois", hashed_password=hash_password("demo1234"), role=UserRole.TOURIST, city="Paris", country="France", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Marie"),
        User(email="tourist3@wandr.demo", full_name="Yuki Tanaka", hashed_password=hash_password("demo1234"), role=UserRole.TOURIST, city="Tokyo", country="Japan", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki"),
        User(email="tourist4@wandr.demo", full_name="Carlos Ruiz", hashed_password=hash_password("demo1234"), role=UserRole.TOURIST, city="Madrid", country="Spain", avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"),
    ]
    for t in tourists:
        db.add(t)
    await db.flush()

    # ─── Tours ─────────────────────────────────────────
    tours_data = [
        # Ana's tours
        dict(
            guide_id=guides[0].id,
            title="Alfama: Fado & Forgotten Stories",
            description="Wind through Lisbon's oldest neighborhood, where every alley has a story. From Moorish walls to fado houses, discover 900 years of history in 90 minutes.",
            city="Lisbon", country="Portugal",
            theme=TourTheme.HISTORY, difficulty=TourDifficulty.MODERATE,
            price=7.99, currency="EUR",
            duration_minutes=90, distance_km=2.8, stop_count=7,
            original_language="en", available_languages=["en", "pt", "es"],
            cover_image_url="https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800",
            start_lat=38.7139, start_lng=-9.1334,
            status=TourStatus.PUBLISHED, quality_score=92.0,
            avg_rating=4.7, review_count=24, total_purchases=89,
            total_completions=67, completion_rate=0.75,
            published_at=now - timedelta(days=45),
            stops=[
                dict(order=1, title="Miradouro de Santa Luzia", description="Start at this iconic viewpoint overlooking the red rooftops of Alfama and the Tagus river.", latitude=38.7118, longitude=-9.1304, audio_duration_seconds=180, image_url="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600", image_caption="The terrace of Santa Luzia with its azulejo panels", walking_instructions="We begin at the Santa Luzia viewpoint. Take a moment to absorb the panorama."),
                dict(order=2, title="Largo das Portas do Sol", description="Just steps away, this square was once a gate in the Moorish city walls.", latitude=38.7124, longitude=-9.1298, audio_duration_seconds=210, walking_instructions="Walk east along the terrace for about 50 meters.", walking_duration_seconds=60),
                dict(order=3, title="Rua de São Miguel", description="Dive into the heart of Alfama through this narrow, laundry-draped street.", latitude=38.7109, longitude=-9.1300, audio_duration_seconds=240, walking_instructions="Head downhill through the archway into the narrow streets.", walking_duration_seconds=120),
                dict(order=4, title="Feira da Ladra Corner", description="The thieves' market has operated here since the 12th century.", latitude=38.7150, longitude=-9.1264, audio_duration_seconds=195, walking_instructions="Continue north toward the flea market area.", walking_duration_seconds=180),
                dict(order=5, title="Panteão Nacional", description="The stunning National Pantheon, once a church plagued by collapses and legends of a curse.", latitude=38.7153, longitude=-9.1247, audio_duration_seconds=270, image_url="https://images.unsplash.com/photo-1548707309-dcebeab426c8?w=600", walking_instructions="Walk toward the domed building you can see ahead.", walking_duration_seconds=90),
                dict(order=6, title="Fado Museum Courtyard", description="Stand where fado was born — the soulful music of longing and the sea.", latitude=38.7104, longitude=-9.1313, audio_duration_seconds=300, walking_instructions="Wind back downhill toward the waterfront.", walking_duration_seconds=240),
                dict(order=7, title="Sé de Lisboa", description="End at Lisbon's medieval cathedral, standing since 1147.", latitude=38.7098, longitude=-9.1325, audio_duration_seconds=250, image_url="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600", image_caption="The Romanesque facade of Lisbon Cathedral", walking_instructions="Walk uphill for 3 minutes to the cathedral.", walking_duration_seconds=180),
            ],
        ),
        dict(
            guide_id=guides[0].id,
            title="Belém: Age of Discovery Walk",
            description="Trace the footsteps of Vasco da Gama and Magellan along the riverfront where Portugal launched its maritime empire.",
            city="Lisbon", country="Portugal",
            theme=TourTheme.HISTORY, difficulty=TourDifficulty.EASY,
            price=6.99, currency="EUR",
            duration_minutes=75, distance_km=2.2, stop_count=6,
            original_language="en", available_languages=["en", "pt"],
            cover_image_url="https://images.unsplash.com/photo-1580323956656-26bbb0a85e75?w=800",
            start_lat=38.6966, start_lng=-9.2063,
            status=TourStatus.PUBLISHED, quality_score=88.0,
            avg_rating=4.5, review_count=18, total_purchases=62,
            total_completions=51, completion_rate=0.82,
            published_at=now - timedelta(days=30),
            stops=[
                dict(order=1, title="Padrão dos Descobrimentos", description="The Monument to the Discoveries stands where ships once departed for unknown worlds.", latitude=38.6936, longitude=-9.2057, audio_duration_seconds=240, image_url="https://images.unsplash.com/photo-1573455494060-c5595004d6c0?w=600"),
                dict(order=2, title="Rosa dos Ventos", description="The giant compass rose in the pavement, a gift from South Africa, maps Portuguese discoveries.", latitude=38.6933, longitude=-9.2060, audio_duration_seconds=180, walking_duration_seconds=30),
                dict(order=3, title="Torre de Belém", description="This UNESCO jewel guarded the entrance to Lisbon's harbour.", latitude=38.6916, longitude=-9.2160, audio_duration_seconds=300, image_url="https://images.unsplash.com/photo-1557093793-e196ae071479?w=600", walking_instructions="Walk west along the waterfront promenade.", walking_duration_seconds=360),
                dict(order=4, title="Mosteiro dos Jerónimos", description="The crown jewel of Manueline architecture, built with spice trade wealth.", latitude=38.6979, longitude=-9.2068, audio_duration_seconds=350, image_url="https://images.unsplash.com/photo-1592327625088-0f465e5e8f38?w=600", walking_instructions="Head back east and cross to the monastery.", walking_duration_seconds=420),
                dict(order=5, title="Pastéis de Belém", description="No visit is complete without the famous custard tarts, made here since 1837.", latitude=38.6975, longitude=-9.2032, audio_duration_seconds=180, walking_instructions="The pastry shop is just east of the monastery.", walking_duration_seconds=120),
                dict(order=6, title="Jardim de Belém", description="End your walk in the gardens, reflecting on five centuries of exploration.", latitude=38.6971, longitude=-9.2050, audio_duration_seconds=150, walking_duration_seconds=60),
            ],
        ),
        # Marco's tours
        dict(
            guide_id=guides[1].id,
            title="Taste of Mouraria: Lisbon's Secret Kitchen",
            description="From century-old tascas to Mozambican spice shops, explore the multicultural flavors of Lisbon's most underrated neighborhood.",
            city="Lisbon", country="Portugal",
            theme=TourTheme.FOOD, difficulty=TourDifficulty.EASY,
            price=8.99, currency="EUR",
            duration_minutes=105, distance_km=2.0, stop_count=8,
            original_language="en", available_languages=["en", "pt", "fr"],
            cover_image_url="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
            start_lat=38.7152, longitude=-9.1355,
            start_lng=-9.1355,
            status=TourStatus.PUBLISHED, quality_score=95.0,
            avg_rating=4.9, review_count=31, total_purchases=112,
            total_completions=98, completion_rate=0.88,
            published_at=now - timedelta(days=60),
            stops=[
                dict(order=1, title="Martinho da Arcada (context)", description="We start near Lisbon's oldest café to set the culinary scene.", latitude=38.7075, longitude=-9.1364, audio_duration_seconds=210),
                dict(order=2, title="Mercearia do Largo", description="A neighborhood grocer where African, Indian, and Portuguese ingredients collide.", latitude=38.7143, longitude=-9.1348, audio_duration_seconds=240, walking_duration_seconds=300),
                dict(order=3, title="Tasca do Chico", description="A fado tasca where petiscos are served with raw emotion.", latitude=38.7137, longitude=-9.1341, audio_duration_seconds=270, walking_duration_seconds=60),
                dict(order=4, title="Cantinho do Aziz", description="Mozambican-Portuguese fusion in a space the size of a closet — and it's magical.", latitude=38.7148, longitude=-9.1332, audio_duration_seconds=240, walking_duration_seconds=90),
                dict(order=5, title="Padaria Portuguesa", description="Learn why Portuguese bread culture is an underrated treasure.", latitude=38.7155, longitude=-9.1326, audio_duration_seconds=180, walking_duration_seconds=60),
                dict(order=6, title="O Velho Eurico", description="A traditional tasca that hasn't changed its recipe in 40 years.", latitude=38.7131, longitude=-9.1310, audio_duration_seconds=240, walking_duration_seconds=120),
                dict(order=7, title="Ginjinha Stall", description="Sip the cherry liqueur that Lisboetas have loved since 1840.", latitude=38.7143, longitude=-9.1387, audio_duration_seconds=195, walking_duration_seconds=180),
                dict(order=8, title="Mercado da Figueira", description="End at this local market where chefs and grandmothers shop side by side.", latitude=38.7132, longitude=-9.1378, audio_duration_seconds=220, walking_duration_seconds=90),
            ],
        ),
        dict(
            guide_id=guides[1].id,
            title="Pastéis & Port: Sweet Side of Lisbon",
            description="A sugar-fueled stroll through Lisbon's best bakeries, chocolate shops, and wine bars.",
            city="Lisbon", country="Portugal",
            theme=TourTheme.FOOD, difficulty=TourDifficulty.EASY,
            price=6.99, currency="EUR",
            duration_minutes=70, distance_km=1.8, stop_count=6,
            original_language="en", available_languages=["en", "pt"],
            cover_image_url="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
            start_lat=38.7100, start_lng=-9.1420,
            status=TourStatus.PUBLISHED, quality_score=85.0,
            avg_rating=4.6, review_count=15, total_purchases=48,
            total_completions=39, completion_rate=0.81,
            published_at=now - timedelta(days=20),
            stops=[
                dict(order=1, title="Manteigaria", description="Watch custard tarts being made through the glass window.", latitude=38.7105, longitude=-9.1422, audio_duration_seconds=200),
                dict(order=2, title="Confeitaria Nacional", description="Operating since 1829, this is Portugal's oldest confectionery.", latitude=38.7132, longitude=-9.1387, audio_duration_seconds=240, walking_duration_seconds=180),
                dict(order=3, title="Landeau Chocolate", description="The chocolate cake that has Lisbon obsessed.", latitude=38.7075, longitude=-9.1462, audio_duration_seconds=180, walking_duration_seconds=240),
                dict(order=4, title="By the Wine", description="A cozy José Maria da Fonseca wine bar in Chiado.", latitude=38.7108, longitude=-9.1420, audio_duration_seconds=220, walking_duration_seconds=180),
                dict(order=5, title="Fábrica dos Pastéis de Nata", description="Compare your pastéis — which bakery wins?", latitude=38.7145, longitude=-9.1398, audio_duration_seconds=180, walking_duration_seconds=150),
                dict(order=6, title="A Ginjinha", description="End with a shot of ginjinha at this legendary standing-room-only bar.", latitude=38.7152, longitude=-9.1390, audio_duration_seconds=160, walking_duration_seconds=60),
            ],
        ),
        # Sofia's tours
        dict(
            guide_id=guides[2].id,
            title="LX Factory to Alcântara: Street Art Trail",
            description="Discover massive murals, political stencils, and guerrilla installations in Lisbon's creative west side.",
            city="Lisbon", country="Portugal",
            theme=TourTheme.STREET_ART, difficulty=TourDifficulty.EASY,
            price=5.99, currency="EUR",
            duration_minutes=80, distance_km=2.5, stop_count=7,
            original_language="en", available_languages=["en", "pt", "de"],
            cover_image_url="https://images.unsplash.com/photo-1561059488-916d69792237?w=800",
            start_lat=38.7036, start_lng=-9.1780,
            status=TourStatus.PUBLISHED, quality_score=90.0,
            avg_rating=4.8, review_count=20, total_purchases=73,
            total_completions=58, completion_rate=0.79,
            published_at=now - timedelta(days=35),
            stops=[
                dict(order=1, title="LX Factory Entrance Mural", description="The gateway piece by Bordalo II, made from recycled trash — a fox that watches over the complex.", latitude=38.7036, longitude=-9.1780, audio_duration_seconds=220, image_url="https://images.unsplash.com/photo-1568738783928-f8727cd40989?w=600"),
                dict(order=2, title="Ler Devagar Bookshop Wall", description="The iconic printing-press-turned-bookshop with its flying bicycle sculpture.", latitude=38.7032, longitude=-9.1775, audio_duration_seconds=200, walking_duration_seconds=60),
                dict(order=3, title="Vhils Carved Portrait", description="Alexandre Farto (Vhils) carved this face directly into the wall with drills and chisels.", latitude=38.7040, longitude=-9.1768, audio_duration_seconds=270, walking_duration_seconds=90),
                dict(order=4, title="Underdogs Gallery Wall", description="Curated outdoor gallery showcasing rotating international artists.", latitude=38.7025, longitude=-9.1745, audio_duration_seconds=240, walking_duration_seconds=150),
                dict(order=5, title="Alcântara Railway Overpass", description="A 200-meter gallery of paste-ups and political stencils under the railway.", latitude=38.7015, longitude=-9.1720, audio_duration_seconds=260, walking_duration_seconds=180),
                dict(order=6, title="Utopia Mural", description="A 4-story collaborative piece imagining Lisbon's future.", latitude=38.7008, longitude=-9.1695, audio_duration_seconds=200, walking_duration_seconds=150),
                dict(order=7, title="Village Underground Lisboa", description="End at the creative hub housed in repurposed shipping containers and double-decker buses.", latitude=38.7020, longitude=-9.1670, audio_duration_seconds=180, image_url="https://images.unsplash.com/photo-1551721434-8b94ddff0e6d?w=600", walking_instructions="Cross toward the container village.", walking_duration_seconds=120),
            ],
        ),
        dict(
            guide_id=guides[2].id,
            title="Bairro Alto After Dark: Nightlife & Neon",
            description="Experience Lisbon's legendary nightlife district — from centuries-old wine bars to underground clubs.",
            city="Lisbon", country="Portugal",
            theme=TourTheme.NIGHTLIFE, difficulty=TourDifficulty.EASY,
            price=5.99, currency="EUR",
            duration_minutes=60, distance_km=1.5, stop_count=6,
            original_language="en", available_languages=["en", "pt"],
            cover_image_url="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
            start_lat=38.7120, start_lng=-9.1450,
            status=TourStatus.PUBLISHED, quality_score=82.0,
            avg_rating=4.4, review_count=12, total_purchases=41,
            total_completions=30, completion_rate=0.73,
            published_at=now - timedelta(days=15),
            stops=[
                dict(order=1, title="Miradouro de São Pedro de Alcântara", description="Start at sunset with the city glowing below you.", latitude=38.7160, longitude=-9.1455, audio_duration_seconds=180),
                dict(order=2, title="Solar do Vinho do Porto", description="A 250-year tradition of port wine tasting in a palace.", latitude=38.7155, longitude=-9.1462, audio_duration_seconds=220, walking_duration_seconds=60),
                dict(order=3, title="Rua da Rosa", description="The beating heart of Bairro Alto nightlife — 50 bars in 200 meters.", latitude=38.7135, longitude=-9.1445, audio_duration_seconds=200, walking_duration_seconds=120),
                dict(order=4, title="Tasca do Chico", description="Spontaneous fado happens here — locals sing from their tables.", latitude=38.7130, longitude=-9.1440, audio_duration_seconds=260, walking_duration_seconds=60),
                dict(order=5, title="Pensão Amor", description="A former brothel turned bohemian bar with a library of erotica.", latitude=38.7075, longitude=-9.1448, audio_duration_seconds=240, walking_duration_seconds=240),
                dict(order=6, title="Pink Street (Rua Nova do Carvalho)", description="End on Lisbon's famous pink-painted street, the new center of nightlife.", latitude=38.7070, longitude=-9.1445, audio_duration_seconds=200, image_url="https://images.unsplash.com/photo-1533105079903-3e4f1a8e27a6?w=600", walking_duration_seconds=60),
            ],
        ),
    ]

    created_tours = []
    for td in tours_data:
        stops_data = td.pop("stops")
        # Fix: remove stray 'longitude' key if present
        td.pop("longitude", None)
        tour = Tour(**td)
        db.add(tour)
        await db.flush()

        for sd in stops_data:
            stop = TourStop(tour_id=tour.id, **sd)
            db.add(stop)

        created_tours.append(tour)

    await db.flush()

    # ─── Reviews ───────────────────────────────────────
    review_data = [
        # Tour 0 (Alfama) reviews
        (0, 0, 5.0, "The story about the Moorish siege gave me chills.", "Incredible storytelling — felt like time travel."),
        (0, 1, 4.5, "Standing at Santa Luzia at sunset.", "Beautiful tour, well-paced. Audio was crystal clear."),
        (0, 2, 4.5, "The fado museum courtyard moment.", "Learned so much! Would love a Part 2."),
        (0, 3, 4.0, None, "Good tour but a few of the walking sections were steep."),
        # Tour 1 (Belém)
        (1, 0, 4.5, "The story of Magellan's departure.", "Amazing historical detail."),
        (1, 1, 4.0, "The pastéis stop, obviously!", "Well structured but I wanted more time at the monastery."),
        (1, 3, 5.0, "Learning about the compass rose.", "Perfect length and pacing."),
        # Tour 2 (Mouraria food)
        (2, 0, 5.0, "The ginjinha tasting!", "Best food tour I've ever done, period."),
        (2, 1, 5.0, "Cantinho do Aziz was life-changing.", "Marco's passion for food is infectious."),
        (2, 2, 4.5, "The story about the Mozambican spice trade.", "Incredible blend of food and history."),
        (2, 3, 5.0, "Every single stop.", "I came back and did this tour twice!"),
        # Tour 4 (Street art)
        (4, 0, 5.0, "The Vhils carved portrait blew my mind.", "Sofia knows every artist personally, it feels like."),
        (4, 1, 4.5, "The Bordalo II recycled fox.", "Great tour for art lovers."),
        (4, 2, 5.0, "The political stencils under the railway.", "Eye-opening perspective on Lisbon's creative scene."),
    ]

    for tour_idx, tourist_idx, rating, best_moment, comment in review_data:
        review = Review(
            tour_id=created_tours[tour_idx].id,
            tourist_id=tourists[tourist_idx].id,
            rating=rating,
            storytelling_rating=min(5.0, rating + 0.2),
            route_rating=rating - 0.2 if rating > 1 else 1.0,
            audio_clarity_rating=min(5.0, rating + 0.1),
            cultural_depth_rating=rating,
            best_moment=best_moment,
            comment=comment,
        )
        db.add(review)

        # Add corresponding purchase
        purchase = Purchase(
            tour_id=created_tours[tour_idx].id,
            tourist_id=tourists[tourist_idx].id,
            amount=created_tours[tour_idx].price,
            currency="EUR",
            status=PurchaseStatus.COMPLETED,
            started_at=now - timedelta(days=10, hours=tourist_idx),
            completed_at=now - timedelta(days=10, hours=tourist_idx - 1),
            last_stop_reached=created_tours[tour_idx].stop_count,
        )
        db.add(purchase)

    await db.flush()
    await db.commit()
