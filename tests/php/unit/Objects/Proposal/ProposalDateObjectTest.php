<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Objects\Proposal;

use ChristophWurst\Nextcloud\Testing\TestCase;
use DateTimeImmutable;
use DateTimeZone;

class ProposalDateObjectTest extends TestCase {

    public function testTimezoneIsLostWhenHydratingFromStore(): void {
        $originalTimezone = new DateTimeZone('America/New_York');
        $originalDate = new DateTimeImmutable('2024-11-03 01:30:00', $originalTimezone);

        $proposalDate = new ProposalDateObject();
        $proposalDate->setDate($originalDate);

        $storedEntry = $proposalDate->toStore();

        $hydratedDate = new ProposalDateObject();
        $hydratedDate->fromStore($storedEntry);

        $this->assertSame('America/New_York', $originalDate->getTimezone()->getName());
        $this->assertSame('UTC', $hydratedDate->getDate()->getTimezone()->getName());
        $this->assertNotSame(
            $originalDate->format(DateTimeImmutable::ATOM),
            $hydratedDate->getDate()->format(DateTimeImmutable::ATOM)
        );
    }
}

