
  <body >
    <!-- ===== Preloader Start ===== -->
    <include src="./partials/preloader.html"></include>
    <!-- ===== Preloader End ===== -->

    <!-- ===== Page Wrapper Start ===== -->
    <div class="flex h-screen overflow-hidden">
      <!-- ===== Sidebar Start ===== -->
      <include src="./partials/sidebar.html"></include>
      <!-- ===== Sidebar End ===== -->

      <!-- ===== Content Area Start ===== -->
      <div
        class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
      >
        <!-- Small Device Overlay Start -->
        <include src="./partials/overlay.html" />
        <!-- Small Device Overlay End -->

        <!-- ===== Header Start ===== -->
        <include src="./partials/header.html" />
        <!-- ===== Header End ===== -->

        <!-- ===== Main Content Start ===== -->
        <main>
          <div class="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
            <!-- Breadcrumb Start -->
            <div>
              <include src="./partials/breadcrumb.html" />
            </div>
            <!-- Breadcrumb End -->

            <div
              class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div id="calendar" class="min-h-screen"></div>
            </div>

            <!-- BEGIN MODAL -->
            <include src="./partials/calendar-event-modal.html" />
            <!-- END MODAL -->
          </div>
        </main>
        <!-- ===== Main Content End ===== -->
      </div>
      <!-- ===== Content Area End ===== -->
    </div>
    <!-- ===== Page Wrapper End ===== -->
  </body>

